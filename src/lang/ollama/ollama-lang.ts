import { LangChatMessages, LangResultWithMessages, LangResultWithString, LanguageModel } from "../language-model.ts";
import { httpRequestWithRetry as fetch } from "../../http-request.ts";
import { processResponseStream } from "../../process-response-stream.ts";

export type OllamaLangOptions = {
  url?: string;
  model: string;
  systemPrompt?: string;
};

export type OllamaLangConfig = {
  url: string;
  model: string;
  systemPrompt: string;
};

export class OllamaLang extends LanguageModel {
  _config: OllamaLangConfig;

  constructor(options: OllamaLangOptions) {
    const model = options.model;
    super(model);
    this._config = {
      url: options.url || "http://localhost:11434",
      model,
      systemPrompt: options.systemPrompt ? options.systemPrompt : '',
    };
  }

  async ask(
    prompt: string,
    onResult?: (result: LangResultWithString) => void,
  ): Promise<LangResultWithString> {
    const result = new LangResultWithString(prompt);

    const onData = (data: any) => {
      if (data.done) {
        result.finished = true;
        onResult?.(result);
        return;
      }

      if (data.message && data.message.content) {
        result.answer += data.message.content;
      }

      onResult?.(result);
    };

    const response = await fetch(`${this._config.url}/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this._config.model,
        prompt,
        stream: true
      }),
    })
      .catch((err) => {
        throw new Error(err);
      });

    await processResponseStream(response, onData);

    return result;
  }

  async chat(messages: LangChatMessages, onResult?: (result: LangResultWithMessages) => void): Promise<LangResultWithMessages> {
    const result = new LangResultWithMessages(
      messages,
    );

    const onData = (data: any) => {
      if (data.done) {
        result.finished = true;
        onResult?.(result);
        return;
      }

      if (data.message && data.message.content) {
        result.answer += data.message.content;
      }

      onResult?.(result);
    };

    const response = await fetch(`${this._config.url}/api/chat`, {
      method: "POST",
      body: JSON.stringify({
        model: this._config.model,
        messages,
        stream: true,
      })
    })
      .catch((err) => {
        throw new Error(err);
      });

    await processResponseStream(response, onData);

    return result;
  }
}
