import { LangVecsModel, LangVecsResult } from "../lang-vecs.ts";
import { httpRequestWithRetry as fetch } from "../../http-request.ts";

export type OpenAILangOptions = {
  apiKey: string;
};

export type OpenAILangVecsConfig = {
  apiKey: string;
  model: string;
};

export class OpenAILangVecs implements LangVecsModel {
  readonly name: string;
  _config: OpenAILangVecsConfig;

  constructor(options: OpenAILangOptions) {
    this._config = {
      apiKey: options.apiKey,
      model: "text-embedding-ada-002",
    };
    this.name = this._config.model;
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
    });

    return vecs;
  }
}
