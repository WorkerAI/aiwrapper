import { LangModelNames } from "../../info.ts";
import { httpRequestWithRetry as fetch } from "../../http-request.ts";
import { processResponseStream } from "../../process-response-stream.ts";
import { LangChatMessages, LangResultFromChat, LangResultWithString, LanguageModel } from "../language-model.ts";

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

      if (data.completion !== undefined) {
        const content = data.completion;
        result.answer += content;
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

    // @TODO: add onNotOkResponse handler

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

    return result;
  }

  async chat(messages: LangChatMessages, onResult: (result: LangResultWithString) => void): Promise<LangResultFromChat> {
    throw new Error("Not implemented yet");
  }
}
