import { LangModelNames } from "../../info.ts";
import {
  DecisionOnNotOkResponse,
  httpRequestWithRetry as fetch,
} from "../../http-request.ts";
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
  systemPrompt?: string;
};

export type AnthropicLangConfig = {
  apiKey: string;
  name: LangModelNames;
  systemPrompt?: string;
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
    const messages: LangChatMessages = [];

    if (this._config.systemPrompt) {
      messages.push({
        role: "system",
        content: this._config.systemPrompt,
      });
    }

    messages.push({
      role: "user",
      content: prompt,
    });

    return await this.chat(messages, onResult);
  }

  async chat(
    messages: LangChatMessages,
    onResult?: (result: LangResultWithMessages) => void,
  ): Promise<LangResultWithMessages> {
    const result = new LangResultWithMessages(
      messages,
    );

    const onData = (data: any) => {
      if (data.type === "message_stop") {
        result.finished = true;
        onResult?.(result);
        return;
      }

      if (
        data.type === "message_delta" && data.delta.stop_reason === "end_turn"
      ) {
        const choices = data.delta.choices;
        if (choices && choices.length > 0) {
          const deltaContent = choices[0].delta.content
            ? choices[0].delta.content
            : "";
          result.answer += deltaContent;
          result.messages = [
            ...messages,
            {
              role: "assistant",
              content: result.answer,
            },
          ];
          onResult?.(result);
        }
      }

      if (data.type === "content_block_delta") {
        const deltaContent = data.delta.text ? data.delta.text : "";
        result.answer += deltaContent;
        onResult?.(result);
      }
    };

    /*
    const onData = (data: any) => {
      switch (data.type) {
        case "message_start":
          // Handle message_start event
          result.answer = "";
          result.messages = [];
          break;

        case "content_block_start":
          // Handle content_block_start event
          // Initialize or reset any necessary state for a new content block
          break;

        case "content_block_delta": {
          // Handle content_block_delta event
          const deltaContent = data.delta.text ? data.delta.text : "";
          result.answer += deltaContent;
          break;
        }

        case "content_block_stop":
          // Handle content_block_stop event
          // Finalize the content block if necessary
          break;

        case "message_delta": {
          // Handle message_delta event
          const choices = data.delta.choices;
          if (choices && choices.length > 0) {
            const deltaContent = choices[0].delta.content
              ? choices[0].delta.content
              : "";
            result.answer += deltaContent;
            result.messages = [
              ...messages,
              {
                role: "assistant",
                content: result.answer,
              },
            ];
            onResult?.(result);
          }
          break;
        }

        case "message_stop": {
          // Handle message_stop event
          result.finished = true;
          onResult?.(result);
          break;
        }

        default:
          // Handle unknown event types if necessary
          break;
      }
    };
    */

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "anthropic-version": "2023-06-01",
        "x-api-key": this._config.apiKey,
      },
      body: JSON.stringify({
        model: this._config.name,
        messages: messages,
        max_tokens: 4096,
        stream: true,
      }),
      onNotOkResponse: async (
        res,
        decision,
      ): Promise<DecisionOnNotOkResponse> => {
        if (res.status === 401) {
          // We don't retry if the API key is invalid.
          decision.retry = false;
          throw new Error(
            "API key is invalid. Please check your API key and try again.",
          );
        }

        if (res.status === 400) {
          const data = await res.text();

          // We don't retry if the model is invalid.
          decision.retry = false;
          throw new Error(
            data,
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
