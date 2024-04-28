import { LangModelNames } from "../../info.ts";
import {
  LangChatMessages,
  LangResultWithMessages,
  LangResultWithString,
  LanguageModel,
} from "../language-model.ts";
import {
  DecisionOnNotOkResponse,
  httpRequestWithRetry as fetch,
} from "../../http-request.ts";
import { processResponseStream } from "../../process-response-stream.ts";

export type GroqLangOptions = {
  apiKey: string;
  model?: LangModelNames;
  systemPrompt?: string;
};

export type GroqLangConfig = {
  apiKey: string;
  name: LangModelNames;
  systemPrompt: string;
};

// @TODO: it's a copy and paste of OpenAILang at the moment. Consider to use OpenAILang
// with the ability of changing the API url
export class GroqLang extends LanguageModel {
  _config: GroqLangConfig;

  constructor(options: GroqLangOptions) {
    const modelName = options.model || "gpt-4";
    super(modelName);
    this._config = {
      apiKey: options.apiKey,
      name: modelName,
      systemPrompt: options.systemPrompt || `You are a helpful assistant.`,
    };
  }

  async ask(
    prompt: string,
    onResult?: (result: LangResultWithString) => void,
  ): Promise<LangResultWithString> {
    const result = new LangResultWithString(
      prompt,
    );

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

        onResult?.(result);
      }
    };

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
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
      onNotOkResponse: (res, decision): DecisionOnNotOkResponse => {
        if (res.status === 401) {
          // We don't retry if the API key is invalid.
          decision.retry = false;
          throw new Error(
            "API key is invalid. Please check your API key and try again.",
          );
        }

        if (res.status === 400) {
          // We don't retry if the model is invalid.
          decision.retry = false;
          throw new Error(
            "Bad Request. Please make sure you send valid data. Could be that the message is too large.",
          );
        }

        return decision;
      },
    })
      .catch((err) => {
        throw new Error(err);
      });

    await processResponseStream(response, onData);

    return result;
  }

  async chat(
    messages: LangChatMessages,
    onResult?: (result: LangResultWithMessages) => void,
  ): Promise<LangResultWithMessages> {
    const result = new LangResultWithMessages(
      messages,
    );

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

        result.messages = [...messages, {
          role: "assistant",
          content: result.answer,
        }];

        onResult?.(result);
      }
    };

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this._config.apiKey}`,
      },
      body: JSON.stringify({
        model: this._config.name,
        messages,
        stream: true,
      }),
      onNotOkResponse: (res, decision): DecisionOnNotOkResponse => {
        if (res.status === 401) {
          // We don't retry if the API key is invalid.
          decision.retry = false;
          throw new Error(
            "API key is invalid. Please check your API key and try again.",
          );
        }

        if (res.status === 400) {
          // We don't retry if the model is invalid.
          decision.retry = false;
          throw new Error(
            "Bad Request. Please make sure you send valid data. Could be that the message is too large.",
          );
        }

        return decision;
      },
    })
      .catch((err) => {
        throw new Error(err);
      });

    await processResponseStream(response, onData);

    return result;
  }
}
