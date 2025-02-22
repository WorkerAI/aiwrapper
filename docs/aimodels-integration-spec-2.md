# AIModels Integration Specification - Alternative API Design

## Overview
This specification outlines an alternative, more fluent API design for AIWrapper's integration with aimodels, focusing on provider and model discovery and initialization.

## Core API Examples

### Provider Discovery and Initialization
```typescript
// Get all providers
const providers = Lang.providers

// Find providers that support a specific model
const provider = providers.withModel("deepseek-r1")[0]

// Check provider requirements
provider.needsApiKey // true for cloud providers, false for local like ollama

// Initialize a provider
const lang = provider.init({ apiKey })

// Use for inference
lang.ask("Hello")
```

### Model-Centric Approach
```typescript
// Find a specific model
const model = Lang.models.id("deepseek-r1")

// Get providers that support this model
const providers = model.providers

// Get first provider that supports the model
const provider = model.providers[0];

const lang = Lang[provider.id]({ apiKey, model })

// Use for chat
provider.chat(messages)
```

## Benefits
1. Intuitive and discoverable API
2. Supports both provider-first and model-first workflows
3. Easy to check provider requirements
4. Natural progression from discovery to initialization
5. Consistent with existing AIWrapper patterns

## Next Steps
1. Define detailed TypeScript interfaces
2. Implement provider discovery and filtering
3. Add model discovery functionality
4. Create provider initialization logic
5. Add tests for new API 