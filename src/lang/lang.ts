import * as info from "../info.ts";
import { OpenAILang, OpenAILangOptions } from "./openai/openAILang.ts";

export abstract class Lang {
  static openai(options: OpenAILangOptions): OpenAILang {
    return new OpenAILang(options);
  }

  static calcLangCost(
    modelName: string,
    inTokens: number,
    outTokens: number,
  ): string {
    let inPricePerToken = 0;
    let outPricePerToken = 0;

    if (info.langPricePerToken.has(modelName)) {
      [inPricePerToken, outPricePerToken] = info.langPricePerToken.get(modelName) as [number, number];
    } else {
      throw new Error(`Unknown model: ${modelName}`);
    }

    return (inTokens * inPricePerToken + outTokens * outPricePerToken).toFixed(
      10,
    );
  }
}

export interface LanguageModel {
  readonly name: string;
  ask(prompt: string, onResult: (result: LangResult) => void): Promise<string>;
  askForObject(typeSample: object, prompt: string): Promise<object>;
  _defaultCalcCost(inTokens: number, outTokens: number): string;
}

export type LangResult = {
  answer: string;
  totalTokens: number;
  promptTokens: number;
  totalPrice: string;
  finished: boolean;
  // readonly abort: () => void;
  // durationMs: number;
};