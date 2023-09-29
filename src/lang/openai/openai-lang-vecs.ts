import { LangVecsModel, LangVecsResult } from "../lang-vecs.ts";
import { Tokenizer } from "../../tokens/tokenizer.ts";
import { getTokenizerBasedOnModel } from "../../info.ts";
import { Lang } from "../lang.ts";

export type OpenAILangOptions = {
  apiKey: string;
  customCalcCost?: (inTokens: number) => string;
};

export type OpenAILangVecsConfig = {
  apiKey: string;
  model: string;
  calcCost: (inTokens: number) => string;
};

export class OpenAILangVecs implements LangVecsModel {
  readonly name: string;
  _config: OpenAILangVecsConfig;
  _tokenizer: Tokenizer;

  constructor(options: OpenAILangOptions) {
    this._config = {
      apiKey: options.apiKey,
      model: "text-embedding-ada-002",
      calcCost: options.customCalcCost || this.defaultCalcCost,
    };
    this.name = this._config.model;

    this._tokenizer = getTokenizerBasedOnModel(this.name);
  }

  async ask(text: string, onResult?: (result: LangVecsResult) => void): Promise<number[]> {
    const obj = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this._config.apiKey}`,
      },
      body: JSON.stringify({
        "input": text,
        "model": this.name,
      }),
    }).then((response) => {
      return response.json();
    });

    const vecs = obj.data[0].embedding;

    onResult?.({ 
      vector: vecs,
      promptTokens: this._tokenizer.encode(text).length,
      totalCost: this._config.calcCost(this._tokenizer.encode(text).length),
    });

    return vecs;
  }

  defaultCalcCost = (inTokens: number): string => {
    return Lang.calcLangCost(this.name, inTokens, 0);
  }
}
