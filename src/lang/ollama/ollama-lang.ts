import { LangModelNames } from "../../info.ts";
import { LangResultWithString, LanguageModel } from "../language-model.ts";
import { DecisionOnNotOkResponse, httpRequestWithRetry as fetch } from "../../http-request.ts";
import { processResponseStream } from "../../process-response-stream.ts";

export type OllamaLangOptions = {
  model?: string;
  systemPrompt?: string;
  customCalcCost?: (inTokens: number, outTokens: number) => string;
};

export type OllamaLangConfig = {
  name: string;
  systemPrompt: string;
  calcCost: (inTokens: number, outTokens: number) => string;
};

export class OllamaLang extends LanguageModel {
  _config: OllamaLangConfig;

  constructor(options: OllamaLangOptions) {
    const modelName = options.model || "mistral";
    super(modelName);
    this._config = {
      name: modelName,
      systemPrompt: options.systemPrompt || `You are a helpful assistant.`,
      calcCost: options.customCalcCost || this.defaultCalcCost,
    };
  }

  async ask(
    prompt: string,
    onResult?: (result: LangResultWithString) => void,
  ): Promise<LangResultWithString> {
    const tokensInSystemPrompt =
    this.tokenizer.encode(this._config.systemPrompt).length;
    const tokensInPrompt = this.tokenizer.encode(prompt).length;

    const result = new LangResultWithString(prompt, tokensInSystemPrompt + tokensInPrompt);

    const onData = (data: any) => {
      if (data.finished) {
        result.finished = true;
        onResult?.(result);
        return;
      }

      if (data.response !== undefined) {
        const deltaContent = data.response 
          ? data.response
          : "";

        result.answer += deltaContent;
        result.totalTokens = tokensInSystemPrompt + tokensInPrompt +
          this.tokenizer.encode(result.answer as string).length;
        // We do it from the config because users may want to set their own price calculation function.
        result.totalCost = this._config.calcCost(
          tokensInSystemPrompt + tokensInPrompt,
          this.tokenizer.encode(result.answer as string).length,
        );

        onResult?.(result);
      }
    };

    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this._config.name,
        prompt,
      }),
    })
      .catch((err) => {
        throw new Error(err);
      });

    await processResponseStream(response, onData);

    return result;
  }
}
