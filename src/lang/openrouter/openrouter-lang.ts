import { OpenAILikeLang } from "../openai-like/openai-like-lang.ts";

export type OpenRouterLangOptions = {
  apiKey: string;
  model?: string;
  systemPrompt?: string;
  maxTokens?: number;
};

export class OpenRouterLang extends OpenAILikeLang {
  constructor(options: OpenRouterLangOptions) {
    const modelName = options.model || "openai/gpt-4o";
    
    super({
      apiKey: options.apiKey,
      name: modelName,
      systemPrompt: options.systemPrompt || "",
      maxTokens: options.maxTokens,
      baseURL: "https://openrouter.ai/api/v1",
    });
  }
} 