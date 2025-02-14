import { Lang } from "../../mod.ts";
import { getEnabledLangProviders, runAllTests, type TestConfig } from "../shared/ai-tests.ts";

// Configuration - in real code should be in .env
const CONFIG: TestConfig = {
  openai: {
    enabled: true,
    options: {
      apiKey: "your-api-key", // Replace with your key
      model: "gpt-4",
      systemPrompt: "You are a helpful assistant",
    },
  },
  // ... other provider configs ...
};

const providers = getEnabledLangProviders(CONFIG, Lang);
await runAllTests(providers); 