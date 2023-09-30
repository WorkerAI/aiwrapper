import { LangModelNames } from "../../info.ts";
import { LangResult, LanguageModel } from "../language-model.ts";
import { httpRequest as fetch } from "../../http-request.ts";
import { processResponseStream } from "../../process-response-stream.ts";

export type OpenAILangOptions = {
  apiKey: string;
  model?: LangModelNames;
  systemPrompt?: string;
  customCalcCost?: (inTokens: number, outTokens: number) => string;
};

export type OpenAILangConfig = {
  apiKey: string;
  name: LangModelNames;
  systemPrompt: string;
  calcCost: (inTokens: number, outTokens: number) => string;
};

export class OpenAILang extends LanguageModel {
  _config: OpenAILangConfig;

  constructor(options: OpenAILangOptions) {
    const modelName = options.model || "gpt-4";
    super(modelName);
    this._config = {
      apiKey: options.apiKey,
      name: modelName,
      systemPrompt: options.systemPrompt || `You are a helpful assistant.`,
      calcCost: options.customCalcCost || this.defaultCalcCost,
    };
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

      if (data.choices !== undefined) {
        const deltaContent = data.choices[0].delta.content
          ? data.choices[0].delta.content
          : "";

        result.answer += deltaContent;
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

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this._config.apiKey}`,
      },
      body: JSON.stringify({
        model: this._config.name,
        messages: [
          {
            role: "system",
            content: this._config.systemPrompt,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
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
