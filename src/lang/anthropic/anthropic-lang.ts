import { LangModelNames } from "../../info.ts";
import { httpRequest as fetch } from "../../http-request.ts";
import { processResponseStream } from "../../process-response-stream.ts";
import { LangResult, LanguageModel } from "../language-model.ts";

export type AnthropicLangOptions = {
  apiKey: string;
  model?: LangModelNames;
  systemPrompt?: string;
  customCalcCost?: (inTokens: number, outTokens: number) => string;
};

export type AnthropicLangConfig = {
  apiKey: string;
  name: LangModelNames;
  systemPrompt: string;
  calcCost: (inTokens: number, outTokens: number) => string;
};

export class AnthropicLang extends LanguageModel {
  readonly name: string;
  _config: AnthropicLangConfig;

  constructor(options: AnthropicLangOptions) {
    const modelName = options.model || "claude-2";
    super(modelName);
    this._config = {
      apiKey: options.apiKey,
      name: modelName,
      systemPrompt: options.systemPrompt || `You are a helpful assistant.`,
      calcCost: options.customCalcCost || this.defaultCalcCost,
    };
    this.name = this._config.name;
  }

  async ask(
    prompt: string,
    onResult?: (result: LangResult) => void,
  ): Promise<string> {
    const result: LangResult = {
      answer: "",
      totalTokens: 0,
      promptTokens: this.tokenizer.encode(this._config.systemPrompt).length +
        this.tokenizer.encode(prompt).length,
      totalCost: "0",
      finished: false,
    };

    const tokensInSystemPrompt =
      this.tokenizer.encode(this._config.systemPrompt).length;
    const tokensInPrompt = this.tokenizer.encode(prompt).length;

    const onData = (data: any) => {
      if (data.finished) {
        result.finished = true;
        onResult?.(result);
        return;
      }

      if (data.completion !== undefined) {
        const content = data.completion;
        result.answer += content;
        result.totalTokens = tokensInSystemPrompt + tokensInPrompt +
          this.tokenizer.encode(result.answer).length;
        // We do it from the config because users may want to set their own price calculation function.
        result.totalCost = this._config.calcCost(
          tokensInSystemPrompt + tokensInPrompt,
          this.tokenizer.encode(result.answer).length,
        );

        onResult?.(result);
      }
    };

    // @TODO: add re-tries with exponential backoff

    const response = await fetch("https://api.anthropic.com/v1/complete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "anthropic-version": "2023-06-01",
        "x-api-key": this._config.apiKey,
      },
      body: JSON.stringify({
        model: this._config.name,
        prompt:
          `\n\nHuman: ${this._config.systemPrompt}\n${prompt}\n\nAssistant:`,
        max_tokens_to_sample: 1000000,
        stream: true,
      }),
    })
      .catch((err) => {
        throw new Error(err);
      });

    await processResponseStream(response, onData);

    return result.answer;
  }
}
