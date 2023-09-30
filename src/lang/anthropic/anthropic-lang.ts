import type { Tokenizer } from "../../tokens/tokenizer.ts";
import { getTokenizerBasedOnModel, LangModelNames } from "../../info.ts";
import { LangResult, LanguageModel } from "../lang.ts";
import { httpRequest as fetch } from "../../http-request.ts";
import { processResponseStream } from "../../process-response-stream.ts";
import { Lang } from "../index.ts";
import { StructuredPrompt } from "../structured-prompt.ts";
import extractJSON from "../json/extract-json.ts";

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

export class AnthropicLang implements LanguageModel {
  readonly name: string;
  _config: AnthropicLangConfig;
  _tokenizer: Tokenizer;

  constructor(options: AnthropicLangOptions) {
    this._config = this._getConfig(options);
    this.name = this._config.name;
    this._tokenizer = getTokenizerBasedOnModel(this._config.name);
  }

  _getConfig(options: AnthropicLangOptions): AnthropicLangConfig {
    return {
      apiKey: options.apiKey,
      name: options.model || "claude-2",
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
      promptTokens: this._tokenizer.encode(this._config.systemPrompt).length +
        this._tokenizer.encode(prompt).length,
      totalCost: "0",
      finished: false,
    };

    const tokensInSystemPrompt =
      this._tokenizer.encode(this._config.systemPrompt).length;
    const tokensInPrompt = this._tokenizer.encode(prompt).length;

    const onData = (data) => {
      if (data.finished) {
        result.finished = true;
        onResult?.(result);
        return;
      }

      if (data.completion !== undefined) {
        const content = data.completion;
        result.answer += content;
        result.totalTokens = tokensInSystemPrompt + tokensInPrompt +
          this._tokenizer.encode(result.answer).length;
        // We do it from the config because users may want to set their own price calculation function.
        result.totalCost = this._config.calcCost(
          tokensInSystemPrompt + tokensInPrompt,
          this._tokenizer.encode(result.answer).length,
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

  async askForJSON(
    structuredPrompt: StructuredPrompt,
    content: { [key: string]: string },
    onResult?: (result: LangResult) => void,
  ): Promise<unknown> {
    let out = null;
    let trialsLeft = 3;
    const trials = trialsLeft;
    let result: LangResult = {
      answer: "",
      totalTokens: 0,
      promptTokens: 0,
      totalCost: "0",
      finished: false,
    };

    while (trialsLeft > 0) {
      trialsLeft--;

      const answer = await this.ask(
        structuredPrompt.getTextPrompt(content),
        (r) => {
          onResult?.(r);
          result = r;
        },
      );
      out = extractJSON(answer);

      // Give it the correct JSON string. Before JSON extraction - the results may have been invalid JSON strings
      result.answer = JSON.stringify(out);

      // @TODO: validate it against the schema

      if (out !== null) {
        break;
      } else if (out === null && trialsLeft <= 0) {
        throw new Error(`Failed to parse JSON after ${trials} trials`);
      }
    }

    // Calling it one more time after parsing JSON to return a valid JSON string
    onResult?.(result);

    return out;
  }

  defaultCalcCost = (inTokens: number, outTokens: number): string => {
    return Lang.calcLangCost(this.name, inTokens, outTokens);
  };
}
