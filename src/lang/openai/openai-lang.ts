import {
  LangChatMessages,
  LangResultWithMessages,
  LangResultWithString,
} from "../language-model.ts";
import { OpenAILikeLang } from "../openai-like/openai-like-lang.ts";
import { models, Model } from 'aimodels';

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
  private modelInfo: Model;

  constructor(options: OpenAILangOptions) {
    const modelName = options.model || "gpt-4o";
    
    // Validate model using aimodels
    const modelInfo = models.fromProvider('openai').id(modelName);
    if (!modelInfo) {
      throw new Error(`Invalid OpenAI model: ${modelName}. Model not found in aimodels database.`);
    }
    
    // Use context window from aimodels if maxTokens not specified
    const maxTokens = options.maxTokens || modelInfo.context.total;
    
    super({
      apiKey: options.apiKey,
      name: modelName,
      systemPrompt: options.systemPrompt || "",
      maxTokens,
      baseURL: "https://api.openai.com/v1",
    });
    
    this.modelInfo = modelInfo;
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
