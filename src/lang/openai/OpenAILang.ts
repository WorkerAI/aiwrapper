import { Tokenizer } from '../../tokens/tokenizer.ts';
import { getTokenizerBasedOnModel, LangModelNames } from '../info.ts';
import { LangTokensFlow, LanguageModel, calcLangPrice, processSSEResponse } from '../lang.ts';
import { httpRequest as fetch } from '../../httpRequest.ts';

export type OpenAILangOptions = {
  apiKey: string;
  model?: LangModelNames;
  systemPrompt?: string;
  customCalcPrice?: (inTokens: number, outTokens: number) => string;
}

export type OpenAILangConfig = {
  apiKey: string;
  model: LangModelNames;
  systemPrompt: string;
  calcPrice: (inTokens: number, outTokens: number) => string;
};

export class OpenAILang implements LanguageModel {
  readonly model: string;
  _config: OpenAILangConfig;
  _tokenizer: Tokenizer;

  constructor(options: OpenAILangOptions) {
    this._config = this._getConfig(options);
    this.model = this._config.model;
    this._tokenizer = getTokenizerBasedOnModel(this._config.model);
  }

  _getConfig(options: OpenAILangOptions) {
    return {
      apiKey: options.apiKey,
      model: options.model || "gpt-4",
      systemPrompt: options.systemPrompt || `You are a helpful assistant.`,
      calcPrice: options.customCalcPrice || this._defaultCalcPrice,
    };
  }

  async askForObject(typeSample: object, prompt: string): Promise<object> {
    throw new Error("Method not implemented.");
  }

  async ask(prompt: string, onStream?): Promise<string> {
    const tokens: LangTokensFlow = {
      answer: "",
      totalTokens: 0,
      promptTokens: this._tokenizer.encode(this._config.systemPrompt).length + this._tokenizer.encode(prompt).length,
      totalPrice: "0",
      finished: false,
    };

    const tokensInSystemPrompt = this._tokenizer.encode(this._config.systemPrompt).length;
    const tokensInPrompt = this._tokenizer.encode(prompt).length;

    const onData = (data) => {
      if (data.finished) {
        tokens.finished = true;
        onStream?.(tokens);
        return;
      }

      if (data.choices !== undefined) {
        const deltaContent = data.choices[0].delta.content
          ? data.choices[0].delta.content
          : "";

        tokens.answer += deltaContent;
        tokens.totalTokens = tokensInSystemPrompt + tokensInPrompt + this._tokenizer.encode(tokens.answer).length;
        // We do it from the config because users may want to set their own price calculation function.
        tokens.totalPrice = this._config.calcPrice(tokensInSystemPrompt + tokensInPrompt, this._tokenizer.encode(tokens.answer).length);

        onStream?.(tokens);
      }
    }

    // @TODO: add re-tries with exponential backoff

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this._config.apiKey}`,
      },
      body: JSON.stringify({
        model: this._config.model,
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

    await processSSEResponse(response, onData);

    return tokens.answer;
  }

  async vectorize(text: string): Promise<number[]> {
    // @TODO: add re-tries with exponential backoff

    const obj = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this._config.apiKey}`,
      },
      body: JSON.stringify({
        "input": text,
        "model": "text-embedding-ada-002",
      }),
    }).then((response) => {
      return response.json();
    });

    const vecs = obj.data[0].embedding;
    return vecs;
  }

  _defaultCalcPrice = (inTokens: number, outTokens: number): string => {
    return calcLangPrice(this._config.model, inTokens, outTokens);
  }
}