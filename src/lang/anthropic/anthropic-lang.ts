import { LangModelNames } from "../../info.ts";
import { httpRequestWithRetry as fetch } from "../../http-request.ts";
import { processResponseStream } from "../../process-response-stream.ts";
import {
  LangChatMessages,
  LangResultWithMessages,
  LangResultWithString,
  LanguageModel,
} from "../language-model.ts";

export type AnthropicLangOptions = {
  apiKey: string;
  model?: LangModelNames;
};

export type AnthropicLangConfig = {
  apiKey: string;
  name: LangModelNames;
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
    };
    this.name = this._config.name;
  }

  async ask(
    prompt: string,
    onResult?: (result: LangResultWithString) => void,
  ): Promise<LangResultWithString> {
    const result = new LangResultWithString(
      prompt
    );

    await this._generate_internal(
      // Format messages in the way that Anthropic expects chats to be formatted.
      `\n\nHuman: ${prompt}\n\nAssistant:`,
      (res, finished) => {
        result.finished = finished;
        result.answer = res;

        onResult?.(result);
      },
    );

    return result;
  }

  async chat(
    messages: LangChatMessages,
    onResult?: (result: LangResultWithMessages) => void,
  ): Promise<LangResultWithMessages> {
    // Turn messages into: "\n\nHuman: Hello, Claude\n\nAssistant: Hello, world\n\nHuman: How many toes do dogs have?"
    const messagesStr = messages.reduce((acc, message) => {
      return acc +
        `{systemPromptMsgs}\n\n${
          getAnhropicRole(message.role)
        }: ${message.content}`;
    }, "") + "\n\nAssistant:";

    const result = new LangResultWithMessages(messages);

    await this._generate_internal(messagesStr, (res, finished) => {
      result.finished = finished;
      result.answer = res;

      result.messages = [...messages, {
        role: "assistant",
        content: result.answer,
      }];

      onResult?.(result);
    });

    return result;
  }

  private async _generate_internal(
    prompt: string,
    onResponse: (res: string, finished: boolean) => void,
  ): Promise<string> {
    let fullResponse = "";

    const onData = (data: any) => {
      if (data.finished) {
        onResponse?.(fullResponse, true);
        return;
      }

      if (data.completion !== undefined) {
        const content = data.completion;
        fullResponse += content;
        onResponse?.(fullResponse, false);
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
        prompt,
        max_tokens_to_sample: 1000000,
        stream: true,
      }),
    })
      .catch((err) => {
        throw new Error(err);
      });

    await processResponseStream(response, onData);

    return fullResponse;
  }
}

function getAnhropicRole(normalizedRole: string) {
  // Just in case
  const r = normalizedRole.toLowerCase();

  switch (r) {
    case "system":
    case "assistant":
      return "Assistant";

    case "user":
      return "Human";

    default:
      throw new Error(`Unknown role: ${normalizedRole}`);
  }
}
