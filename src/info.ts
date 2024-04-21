
/**
 * Supported Language Models.
 */
export type OpenAILangModelNames =
  | "gpt-4"
  | "gpt-4-32"
  | "gpt-4-1106-preview"
  | "gpt-3.5-turbo"
  | "gpt-3.5-turbo-16"
  | "text-embedding-ada-002";

export type AnthropicLangModelNames = 
  | "claude-2"
  | "claude-instant-1";

export type LangModelNames = 
  | OpenAILangModelNames 
  | AnthropicLangModelNames;