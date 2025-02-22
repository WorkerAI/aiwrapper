import {
  Lang,
  LanguageModel,
} from "../../mod.ts";
import { config } from "https://deno.land/x/dotenv@v3.2.2/mod.ts";

// Load environment variables
await config({ export: true });

// Configuration - using environment variables
const CONFIG = {
  openai: {
    enabled: true,
    options: {
      apiKey: Deno.env.get("OPENAI_API_KEY") || "",
      model: "gpt-4o",
    },
  },
  anthropic: {
    enabled: true,
    options: {
      apiKey: Deno.env.get("ANTHROPIC_API_KEY") || "",
      model: "claude-3-sonnet-20240229",
    },
  },
  groq: {
    enabled: true,
    options: {
      apiKey: Deno.env.get("GROQ_API_KEY") || "",
      model: "mixtral-8x7b-32768",
    },
  },
  xai: {
    enabled: true,
    options: {
      apiKey: Deno.env.get("XAI_API_KEY") || "",
      model: "grok-2",
    },
  },
  google: {
    enabled: true,
    options: {
      apiKey: Deno.env.get("GOOGLE_API_KEY") || "",
      model: "gemini-2.0-flash",
    },
  },
  cohere: {
    enabled: true,
    options: {
      apiKey: Deno.env.get("COHERE_API_KEY") || "",
      model: "command-r-plus-08-2024",
    },
  },
  openrouter: {
    enabled: true,
    options: {
      apiKey: Deno.env.get("OPENROUTER_API_KEY") || "",
      model: "openai/gpt-3.5-turbo",
    },
  },
  ollama: {
    enabled: true,
    options: {
      model: "olmo2:latest",
      url: "http://localhost:11434",
    },
  },
  deepseek: {
    enabled: true,
    options: {
      apiKey: Deno.env.get("DEEPSEEK_API_KEY") || "",
      model: "deepseek-reasoner",
    },
  },
} as const;

function getEnabledLangProviders() {
  const models: Record<string, LanguageModel> = {};
  
  if (CONFIG.openai.enabled && CONFIG.openai.options.apiKey) {
    models["OpenAI"] = Lang.openai(CONFIG.openai.options);
  }
  if (CONFIG.anthropic.enabled && CONFIG.anthropic.options.apiKey) {
    models["Anthropic"] = Lang.anthropic(CONFIG.anthropic.options);
  }
  if (CONFIG.groq.enabled) {
    models["Groq"] = Lang.groq(CONFIG.groq.options);
  }
  if (CONFIG.xai.enabled) {
    models["xAI"] = Lang.xai(CONFIG.xai.options);
  }
  if (CONFIG.google.enabled) {
    models["Google"] = Lang.google(CONFIG.google.options);
  }
  if (CONFIG.cohere.enabled) {
    models["Cohere"] = Lang.cohere(CONFIG.cohere.options);
  }
  if (CONFIG.openrouter.enabled) {
    models["OpenRouter"] = Lang.openrouter(CONFIG.openrouter.options);
  }
  if (CONFIG.ollama.enabled) {
    models["Ollama"] = Lang.ollama(CONFIG.ollama.options);
  }
  if (CONFIG.deepseek.enabled) {
    models["DeepSeek"] = Lang.deepseek(CONFIG.deepseek.options);
  }
  
  return models;
}

async function testBasicChat() {
  console.log("\n=== Testing Basic Chat ===");
  const providers = getEnabledLangProviders();
  
  if (Object.keys(providers).length === 0) {
    console.log("❌ No models enabled for testing - please check your .env file");
    return;
  }

  console.log(`✓ Found ${Object.keys(providers).length} enabled providers: ${Object.keys(providers).join(", ")}\n`);
  const prompt = "What is 2 + 2? Answer in one word.";

  for (const [name, lang] of Object.entries(providers)) {
    try {
      console.log(`Testing ${name}...`);
      console.log(`Prompt: "${prompt}"`);
      const response = await lang.ask(prompt, (res) => {
        console.log(`${name} streaming: ${res.answer}`);
      });
      console.log(`✓ ${name} final response: ${response.answer}\n`);
    } catch (error: unknown) {
      console.error(`❌ ${name} Error:`, error instanceof Error ? error.message : String(error));
    }
  }
}

async function testSystemPrompts() {
  console.log("\n=== Testing System Prompts ===");
  const providers = getEnabledLangProviders();
  
  if (Object.keys(providers).length === 0) {
    console.log("❌ No models enabled for testing - please check your .env file");
    return;
  }

  console.log(`✓ Found ${Object.keys(providers).length} enabled providers: ${Object.keys(providers).join(", ")}\n`);
  const messages = [
    {
      role: "system",
      content: "You are a pirate. Always speak like one.",
    },
    {
      role: "user",
      content: "How are you today?",
    },
  ];

  for (const [name, lang] of Object.entries(providers)) {
    try {
      console.log(`Testing ${name}...`);
      await lang.chat(messages, (res) => {
        console.log(`${name} streaming: ${res.answer}`);
      });
    } catch (error: unknown) {
      console.error(`❌ ${name} Error:`, error instanceof Error ? error.message : String(error));
    }
  }
}

async function testStructuredOutput() {
  console.log("\n=== Testing Structured Output ===");
  const providers = getEnabledLangProviders();
  
  if (Object.keys(providers).length === 0) {
    console.log("❌ No models enabled for testing - please check your .env file");
    return;
  }

  console.log(`✓ Found ${Object.keys(providers).length} enabled providers: ${Object.keys(providers).join(", ")}\n`);
  const prompt = {
    instructions: [
      "Generate 3 company names for a tech startup",
      "For each name, provide a short description",
    ],
    objectExamples: [{
      names: [
        { name: "TechCo", description: "A tech company" },
        { name: "DataFlow", description: "A data company" },
      ],
    }],
  };

  for (const [name, lang] of Object.entries(providers)) {
    try {
      console.log(`Testing ${name}...`);
      const result = await lang.askForObject(prompt, (res) => {
        console.log(`${name} streaming: ${res.answer}`);
      });
      console.log(`✓ ${name} final result:`, result.answerObj, "\n");
    } catch (error: unknown) {
      console.error(`❌ ${name} Error:`, error instanceof Error ? error.message : String(error));
    }
  }
}

async function testErrorHandling() {
  console.log("\n=== Testing Error Handling ===");

  const invalidLang = Lang.openai({
    apiKey: "invalid-key",
    model: "gpt-4",
  });

  try {
    console.log("Testing invalid API key...");
    await invalidLang.ask("This should fail");
    console.error("❌ Test failed: Expected an error but got none");
  } catch (error) {
    console.log("✓ Expected error caught:", String(error));
  }
}

async function runAllTests() {
  try {
    await testBasicChat();
    await testSystemPrompts();
    await testStructuredOutput();
    await testErrorHandling();
  } catch (error) {
    console.error("Test suite error:", error);
  }
}

// Run all tests
await runAllTests();
