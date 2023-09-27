import * as info from '../info.ts'
import { OpenAILang, OpenAILangOptions } from './openai/openAILang.ts';

export class Lang {
  static openai(options: OpenAILangOptions): OpenAILang {
    return new OpenAILang(options);
  }
}

export interface LanguageModel {
  readonly model: string;
  ask(prompt: string): Promise<string>;
  askForObject(typeSample: object, prompt: string): Promise<object>;
  vectorize(prompt: string): Promise<number[]>;
  _defaultCalcPrice(inTokens: number, outTokens: number): string;
}

export type LangTokensFlow = {
  answer: string;
  totalTokens: number;
  promptTokens: number;
  totalPrice: string;
  finished: boolean;
  // readonly abort: () => void;
  // durationMs: number;
};

export const calcLangPrice = (model: info.LangModelNames, inTokens: number, outTokens: number): string => {
  let inPricePerToken = 0;
  let outPricePerToken = 0;
  
  if (info.langPricePerToken.has(model)) {
    [inPricePerToken, outPricePerToken] = info.langPricePerToken.get(model) as [number, number];
  } else {
    throw new Error(`Unknown model: ${model}`);
  }

  return (inTokens * inPricePerToken + outTokens * outPricePerToken).toFixed(10);
};

export const processSSEResponse = (
  response: Response,
  onData,
): Promise<void> => {
  const reader = response.body!.getReader();
  let decoder = new TextDecoder("utf-8");
  let rawData = "";

  return reader.read().then(function processStream(result): Promise<void> {
    if (result.done || result.value === undefined) {
      return Promise.resolve();
    }

    rawData += decoder.decode(result.value, {
      stream: true,
    });

    // Process each complete message (messages are devived by newlines)
    let lastIndex = rawData.lastIndexOf("\n");
    if (lastIndex > -1) {
      processLines(rawData.slice(0, lastIndex), onData);
      rawData = rawData.slice(lastIndex + 1);
    }

    return reader.read().then(processStream);
  });
};

const processLines = (rawData: string, onData) => {
  const lines = rawData.split("\n");
  for (const line of lines) {
    if (line.startsWith("data: ")) {
      const dataStr = line.substring(6);

      // @TODO: Figure out a way to detect the successful end of stream 
      // on other models. [Done] is OpenAI specific.
      if (dataStr === "[DONE]") {
        onData({ finished: true });
        return;
      }

      try {
        const data = JSON.parse(dataStr);
        onData(data);
      } catch (err) {
        onData({ finished: true });
        console.error(err);
      }
    }
  }
};