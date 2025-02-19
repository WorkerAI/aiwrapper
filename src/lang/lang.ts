import { OpenAILang, OpenAILangOptions } from "./openai/openai-lang.ts";
import { AnthropicLang, AnthropicLangOptions  } from "./anthropic/anthropic-lang.ts";
import { OllamaLang, OllamaLangOptions } from "./ollama/ollama-lang.ts";
import { GroqLang, GroqLangOptions } from "./groq/groq-lang.ts";
import { DeepSeekLang, DeepSeekLangOptions } from "./deepseek/deepseek-lang.ts";
import { XAILang, XAILangOptions } from "./xai/xai-lang.ts";
import { GoogleLang, GoogleLangOptions } from "./google/google-lang.ts";

/**
 * Lang is a factory class for using language models from different providers. 
 */
export abstract class Lang {
  static openai(options: OpenAILangOptions): OpenAILang {
    return new OpenAILang(options);
  }

  static anthropic(options: AnthropicLangOptions): AnthropicLang {
    return new AnthropicLang(options);
  }

  static ollama(options: OllamaLangOptions): OllamaLang {
    return new OllamaLang(options);
  }

  static groq(options: GroqLangOptions): GroqLang {
    return new GroqLang(options);
  }

  static deepseek(options: DeepSeekLangOptions): DeepSeekLang {
    return new DeepSeekLang(options);
  }

  static xai(options: XAILangOptions): XAILang {
    return new XAILang(options);
  }

  static google(options: GoogleLangOptions): GoogleLang {
    return new GoogleLang(options);
  }
}