# AIModels Integration Specification

## Overview
This specification outlines the integration between AIWrapper and the aimodels package to expose provider and model information to users.

## Goals
- Provide easy access to AI provider information
- Allow discovery of available models for each provider
- Maintain consistency with aimodels interfaces
- Keep the API simple and intuitive

## Provider Interface
We use the Provider interface from aimodels:

```typescript
export interface Provider {
  /** Provider identifier */
  id: string;
  /** Display name */
  name: string;
  /** Website URL */
  websiteUrl: string;
  /** API endpoint */
  apiUrl: string;
  /** Default model */
  defaultModel?: string;
  /** Whether this is a local provider */
  isLocal?: number;
  /** Model pricing */
  models: Record<string, ModelPrice | ImagePrice>;
}
```

## Implementation

### Lang Class Extensions

```typescript
abstract class Lang {
  /**
   * Get information about all supported AI providers
   * @returns Record of provider IDs to Provider information
   */
  static get providers(): Record<string, Provider> {
    return {
      openai: {
        id: "openai",
        name: "OpenAI",
        websiteUrl: "https://openai.com",
        apiUrl: "https://api.openai.com/v1",
        defaultModel: "gpt-4-turbo-preview",
        models: {
          "gpt-4-turbo-preview": { input: 0.01, output: 0.03 },
          "gpt-4": { input: 0.03, output: 0.06 }
        }
      },
      anthropic: {
        id: "anthropic",
        name: "Anthropic",
        websiteUrl: "https://anthropic.com",
        apiUrl: "https://api.anthropic.com",
        defaultModel: "claude-3-sonnet-20240229",
        models: {
          "claude-3-sonnet-20240229": { input: 0.008, output: 0.024 }
        }
      },
      ollama: {
        id: "ollama",
        name: "Ollama",
        websiteUrl: "https://ollama.ai",
        apiUrl: "http://localhost:11434",
        isLocal: 1,
        models: {}
      }
    };
  }

  /**
   * Get a specific provider's information
   * @param providerId The provider identifier
   * @returns Provider information or undefined if not found
   */
  static getProvider(providerId: string): Provider | undefined {
    return this.providers[providerId];
  }

  /**
   * Get all available models for a specific provider
   * @param providerId The provider identifier
   * @returns Array of Model objects from aimodels
   */
  static getProviderModels(providerId: string): Model[] {
    return models.provider(providerId) || [];
  }

  /**
   * Check if a model is supported by a provider
   * @param providerId The provider identifier
   * @param modelId The model identifier
   * @returns boolean indicating if the model is supported
   */
  static isModelSupported(providerId: string, modelId: string): boolean {
    const model = models.id(modelId);
    return model?.provider === providerId;
  }
}
```

## Usage Examples

### List All Providers
```typescript
const providers = Lang.providers;
```

### Get Specific Provider Info
```typescript
const openai = Lang.getProvider("openai");
```

### Get Provider Models
```typescript
const openaiModels = Lang.getProviderModels("openai");
```

### Check Model Support
```typescript
const isSupported = Lang.isModelSupported("openai", "gpt-4");
```

### Initialize a Model
```typescript
const openai = Lang.getProvider("openai");
const lang = Lang.openai({
  apiKey: "your-key",
  model: openai.defaultModel
});
```

## Benefits
1. Simple and discoverable API
2. Type-safe provider and model information
3. Consistent with aimodels package
4. Easy access to pricing information
5. Support for both cloud and local providers

## Next Steps
1. Implement the provider information getter
2. Add provider-specific model lists
3. Update documentation
4. Add tests for new functionality 