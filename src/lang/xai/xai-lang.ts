import {
  LangChatMessages,
  LangResultWithMessages,
  LangResultWithString,
} from "../language-model.ts";
import { OpenAILikeLang } from "../openai-like/openai-like-lang.ts";
import { models, Model } from 'aimodels';

export type XAILangOptions = {
  apiKey: string;
  model?: string;
  systemPrompt?: string;
  maxTokens?: number;
};

export class XAILang extends OpenAILikeLang {
  constructor(options: XAILangOptions) {
    const modelName = options.model || "grok-2";
    
    super({
      apiKey: options.apiKey,
      name: modelName,
      systemPrompt: options.systemPrompt || "",
      maxTokens: options.maxTokens,
      baseURL: "https://api.x.ai/v1",
    });
  }
} 