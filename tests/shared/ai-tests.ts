import type {
  Lang,
  LanguageModel,
} from "../../mod.ts";

export interface TestConfig {
  openai?: {
    enabled: boolean;
    options: {
      apiKey: string;
      model: string;
      systemPrompt?: string;
      maxTokens?: number;
    };
  };
  anthropic?: {
    enabled: boolean;
    options: {
      apiKey: string;
      model: string;
      systemPrompt?: string;
      maxTokens?: number;
    };
  };
  groq?: {
    enabled: boolean;
    options: {
      apiKey: string;
      model: string;
      systemPrompt?: string;
    };
  };
  ollama?: {
    enabled: boolean;
    options: {
      model: string;
      systemPrompt?: string;
      url: string;
    };
  };
  deepseek?: {
    enabled: boolean;
    options: {
      apiKey: string;
      model: string;
      systemPrompt?: string;
      maxTokens?: number;
    };
  };
}

export function getEnabledLangProviders(config: TestConfig, Lang: any) {
  const models: Record<string, LanguageModel> = {};
  
  if (config.openai?.enabled) {
    models["OpenAI"] = Lang.openai(config.openai.options);
  }
  if (config.anthropic?.enabled) {
    models["Anthropic"] = Lang.anthropic(config.anthropic.options);
  }
  if (config.groq?.enabled) {
    models["Groq"] = Lang.groq(config.groq.options);
  }
  if (config.ollama?.enabled) {
    models["Ollama"] = Lang.ollama(config.ollama.options);
  }
  if (config.deepseek?.enabled) {
    models["DeepSeek"] = Lang.deepseek(config.deepseek.options);
  }
  
  return models;
}

export async function testBasicChat(providers: Record<string, LanguageModel>) {
  console.log("\n=== Testing Basic Chat ===");
  
  if (Object.keys(providers).length === 0) {
    console.log("No models enabled for testing");
    return;
  }

  const prompt = "What is 2 + 2? Answer in one word.";

  for (const [name, lang] of Object.entries(providers)) {
    try {
      console.log(`\nTesting ${name}:`);
      const response = await lang.ask(prompt, (res) => {
        console.log(res.answer);
      });
      console.log("\nFinal response:", response.answer);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(`${name} Error:`, error.message);
      } else {
        console.error(`${name} Error:`, String(error));
      }
    }
  }
}

// ... rest of test functions moved from deno.ts ...

export async function runAllTests(providers: Record<string, LanguageModel>) {
  try {
    await testBasicChat(providers);
    await testSystemPrompts(providers);
    await testStructuredOutput(providers);
    await testErrorHandling();
  } catch (error) {
    console.error("Test suite error:", error);
  }
} 