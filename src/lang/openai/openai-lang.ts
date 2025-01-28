import {
  LangChatMessages,
  LangResultWithMessages,
  LangResultWithString,
} from "../language-model.ts";
import { OpenAILikeLang } from "../openai-like/openai-like-lang.ts";

export type OpenAILangOptions = {
  apiKey: string;
  model?: string;
  systemPrompt?: string;
  maxTokens?: number;
};

export type OpenAILangConfig = {
  apiKey: string;
  name: string;
  systemPrompt: string;
  maxTokens?: number;
};

export type OpenAIChatMessage = {
  role: "developer" | "user" | "assistant";
  content: string;
};

export class OpenAILang extends OpenAILikeLang {
  constructor(options: OpenAILangOptions) {
    const modelName = options.model || "gpt-4o";
    super({
      apiKey: options.apiKey,
      name: modelName,
      systemPrompt: options.systemPrompt || "",
      maxTokens: options.maxTokens,
      baseURL: "https://api.openai.com/v1",
    });
  }

  protected override transformMessages(messages: LangChatMessages): LangChatMessages {
    return messages.map((message) => {
      if (message.role === "system" && this._config.name.includes("o1")) {
        return { ...message, role: "user" };
      }
      else if (message.role === "system") {
        return { ...message, role: "developer" };
      }
      return message;
    });
  }

  override async ask(
    prompt: string,
    onResult?: (result: LangResultWithString) => void,
  ): Promise<LangResultWithString> {
    return await super.ask(prompt, onResult);
  }

  override async chat(
    messages: LangChatMessages,
    onResult?: (result: LangResultWithMessages) => void,
  ): Promise<LangResultWithMessages> {
    return await super.chat(messages, onResult);
  }
}
