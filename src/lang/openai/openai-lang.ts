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

export type OpenAILangOptions = {
  apiKey: string;
  model?: LangModelNames;
  systemPrompt?: string;
  customCalcCost?: (inTokens: number, outTokens: number) => string;
};

export type OpenAILangConfig = {
  apiKey: string;
  name: LangModelNames;
  systemPrompt: string;
  calcCost: (inTokens: number, outTokens: number) => string;
};

export class OpenAILang extends LanguageModel {
  _config: OpenAILangConfig;

  constructor(options: OpenAILangOptions) {
    const modelName = options.model || "gpt-4";
    super(modelName);
    this._config = {
      apiKey: options.apiKey,
      name: modelName,
      systemPrompt: options.systemPrompt || `You are a helpful assistant.`,
      calcCost: options.customCalcCost || this.defaultCalcCost,
    };
  }

  async ask(
    prompt: string,
    onResult?: (result: LangResultWithString) => void,
  ): Promise<LangResultWithString> {
    const tokensInSystemPrompt =
      this.tokenizer.encode(this._config.systemPrompt).length;
    const tokensInPrompt = this.tokenizer.encode(prompt).length;

    const result = new LangResultWithString(
      prompt,
      tokensInSystemPrompt + tokensInPrompt,
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
        result.totalTokens = tokensInSystemPrompt + tokensInPrompt +
          this.tokenizer.encode(result.answer as string).length;
        // We do it from the config because users may want to set their own price calculation function.
        result.totalCost = this._config.calcCost(
          tokensInSystemPrompt + tokensInPrompt,
          this.tokenizer.encode(result.answer as string).length,
        );

        onResult?.(result);
      }
    };

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
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
    const tokensInSystemPrompt =
      this.tokenizer.encode(this._config.systemPrompt).length;

    // @TODO: check if this is an accurate way to feed tokens to the encoder
    let messagesStrForCountingTokens = '';
    messages.forEach((message, _) => {
      messagesStrForCountingTokens += `${message.content}\n`;
    });

    const tokensInPrompt = this.tokenizer.encode(messagesStrForCountingTokens).length;

    const result = new LangResultWithMessages(
      messages,
      tokensInSystemPrompt + tokensInPrompt,
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
        result.totalTokens = tokensInSystemPrompt + tokensInPrompt +
          this.tokenizer.encode(result.answer as string).length;
        // We do it from the config because users may want to set their own price calculation function.
        result.totalCost = this._config.calcCost(
          tokensInSystemPrompt + tokensInPrompt,
          this.tokenizer.encode(result.answer as string).length,
        );

        result.messages = [...messages, {
          role: "assistant",
          content: deltaContent,
        }];

        onResult?.(result);
      }
    };

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
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
