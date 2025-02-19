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
import { models } from 'aimodels';
import { calculateModelResponseTokens } from "../utils/token-calculator.ts";

export type CohereLangOptions = {
  apiKey: string;
  model?: string;
  systemPrompt?: string;
  maxTokens?: number;
};

export class CohereLang extends LanguageModel {
  private _apiKey: string;
  private _model: string;
  private _systemPrompt: string;
  private _maxTokens?: number;

  constructor(options: CohereLangOptions) {
    const modelName = options.model || "command-r-plus-08-2024";
    super(modelName);

    // Get model info from aimodels
    const modelInfo = models.id(modelName);
    if (!modelInfo) {
      //throw new Error(`Invalid Cohere model: ${modelName}. Model not found in aimodels database.`);
    }

    this._apiKey = options.apiKey;
    this._model = modelName;
    this._systemPrompt = options.systemPrompt || "";
    this._maxTokens = options.maxTokens;
  }

  async ask(
    prompt: string,
    onResult?: (result: LangResultWithString) => void,
  ): Promise<LangResultWithString> {
    const messages: LangChatMessages = [];

    if (this._systemPrompt) {
      messages.push({
        role: "system",
        content: this._systemPrompt,
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
    const result = new LangResultWithMessages(messages);

    // Transform messages to Cohere's format
    const transformedMessages = messages.map(msg => ({
      role: msg.role === "assistant" ? "assistant" : "user", // Cohere only accepts "user" and "assistant"
      content: msg.content
    }));

    const requestBody = {
      messages: transformedMessages,
      model: this._model,
      max_tokens: this._maxTokens,
      temperature: 0.7,
      stream: true,
      preamble_override: this._systemPrompt || undefined,
    };

    const onData = (data: any) => {
      if (data.type === "message-end") {
        result.finished = true;
        onResult?.(result);
        return;
      }

      // Handle Cohere's streaming format
      if (data.type === "content-delta" && data.delta?.message?.content?.text) {
        const text = data.delta.message.content.text;
        result.answer += text;

        result.messages = [...messages, {
          role: "assistant",
          content: result.answer,
        }];

        onResult?.(result);
      }
    };

    const response = await fetch("https://api.cohere.com/v2/chat?alt=sse", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this._apiKey}`,
        "Accept": "text/event-stream",
      },
      body: JSON.stringify(requestBody),
      onNotOkResponse: async (
        res,
        decision,
      ): Promise<DecisionOnNotOkResponse> => {
        if (res.status === 401) {
          decision.retry = false;
          throw new Error(
            "API key is invalid. Please check your API key and try again.",
          );
        }

        if (res.status === 400 || res.status === 422) {
          const data = await res.text();
          decision.retry = false;
          throw new Error(data);
        }

        return decision;
      },
    }).catch((err) => {
      throw new Error(err);
    });

    await processResponseStream(response, onData);

    return result;
  }
} 