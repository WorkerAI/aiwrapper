import { LangChatMessages, LangResultWithMessages, LangResultWithString, LanguageModel } from "../language-model.ts";
import { httpRequestWithRetry as fetch } from "../../http-request.ts";
import { processResponseStream } from "../../process-response-stream.ts";

export type OllamaLangOptions = {
  url?: string;
  model?: string;
  systemPrompt?: string;
};

export type OllamaLangConfig = {
  url: string;
  name: string;
  systemPrompt: string;
};

export class OllamaLang extends LanguageModel {
  _config: OllamaLangConfig;

  constructor(options: OllamaLangOptions) {
    const modelName = options.model || "mistral";
    super(modelName);
    this._config = {
      url: options.url || "http://localhost:11434/",
      name: modelName,
      systemPrompt: options.systemPrompt || `You are a helpful assistant.`,
    };
  }

  async ask(
    prompt: string,
    onResult?: (result: LangResultWithString) => void,
  ): Promise<LangResultWithString> {
    const result = new LangResultWithString(prompt);

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


        onResult?.(result);
      }
    };

    const response = await fetch(`${this._config.url}api/generate`, {
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

  chat(messages: LangChatMessages, onResult: (result: LangResultWithMessages) => void): Promise<LangResultWithMessages> {
    throw new Error("Not implemented yet");
  }
}
