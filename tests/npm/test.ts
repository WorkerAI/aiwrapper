import { assertEquals, assertExists } from "https://deno.land/std@0.220.1/assert/mod.ts";
import { Lang } from "../../dist/npm-entry.js";
import { getEnabledLangProviders, type TestConfig } from "../shared/ai-tests.ts";

// Load test configuration
let testConfig;
try {
  testConfig = JSON.parse(await Deno.readTextFile("./test.config.json"));
} catch (error) {
  console.log("No test.config.json found. Please copy test.config.template.json to test.config.json and add your API keys.");
  Deno.exit(1);
}

// Configure providers
const CONFIG: TestConfig = {
  openai: {
    enabled: !!testConfig.openai?.apiKey,
    options: {
      apiKey: testConfig.openai?.apiKey || "invalid-key",
      model: "gpt-4",
      systemPrompt: "You are a helpful assistant",
    },
  },
  anthropic: {
    enabled: !!testConfig.anthropic?.apiKey,
    options: {
      apiKey: testConfig.anthropic?.apiKey || "invalid-key",
      model: "claude-3-sonnet-20240229",
      systemPrompt: "You are a helpful assistant",
    },
  },
  groq: {
    enabled: !!testConfig.groq?.apiKey,
    options: {
      apiKey: testConfig.groq?.apiKey || "invalid-key",
      model: "mixtral-8x7b-32768",
      systemPrompt: "You are a helpful assistant",
    },
  },
};

const providers = getEnabledLangProviders(CONFIG, Lang);

// Basic chat functionality tests
Deno.test("Basic chat functionality", async (t) => {
  for (const [name, lang] of Object.entries(providers)) {
    await t.step(`${name}: should respond to a simple question`, async () => {
      const response = await lang.ask("What is 2 + 2? Answer in one word.");
      assertExists(response.answer, "Response answer should exist");
      assertEquals(typeof response.answer, "string", "Response should be a string");
    });

    await t.step(`${name}: should handle streaming responses`, async () => {
      let streamedContent = "";
      const response = await lang.ask(
        "Count from 1 to 3 slowly.",
        (res) => {
          streamedContent += res.answer;
        }
      );
      assertExists(response.answer, "Response answer should exist");
      assertEquals(typeof streamedContent, "string", "Streamed content should be a string");
      assertTrue(streamedContent.length > 0, "Streamed content should not be empty");
    });
  }
});

// Object generation tests
Deno.test("Structured output", async (t) => {
  for (const [name, lang] of Object.entries(providers)) {
    await t.step(`${name}: should generate structured JSON output`, async () => {
      const result = await lang.askForObject({
        instructions: ["Generate a person's basic info"],
        objectExamples: [{
          name: "John Doe",
          age: 30,
          occupation: "Engineer"
        }]
      });
      
      assertExists(result.answerObj, "Result object should exist");
      const person = result.answerObj as { name: string; age: number; occupation: string };
      assertEquals(typeof person.name, "string", "Name should be a string");
      assertEquals(typeof person.age, "number", "Age should be a number");
      assertEquals(typeof person.occupation, "string", "Occupation should be a string");
    });
  }
});

// Template usage tests
Deno.test("Template usage", async (t) => {
  for (const [name, lang] of Object.entries(providers)) {
    await t.step(`${name}: should work with prompt templates`, async () => {
      const template = (subject: string) => `Write one sentence about ${subject}.`;
      const response = await lang.ask(template("cats"));
      assertExists(response.answer, "Response answer should exist");
      assertEquals(typeof response.answer, "string", "Response should be a string");
    });
  }
});

// Error handling tests
Deno.test("Error handling", async (t) => {
  await t.step("should handle invalid API key", async () => {
    const invalidLang = Lang.openai({ apiKey: "invalid-key" });
    try {
      await invalidLang.ask("Hello");
      throw new Error("Should have thrown an error for invalid API key");
    } catch (error) {
      assertExists(error, "Error should exist");
    }
  });
});

function assertTrue(condition: boolean, msg = "Expected true but got false") {
  assertEquals(condition, true, msg);
} 