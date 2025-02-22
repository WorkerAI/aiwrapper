# AIModels Package Changes Specification

## Overview
This specification outlines minimal additions to aimodels package to support model and provider discovery.

## Current State
The aimodels package provides:
- `ModelCollection` class with filtering methods (can, know, withMinContext, etc.)
- `ModelsCollection` with provider and creator discovery
- Rich model information and capabilities

## Required Changes

### 1. AIModels Enhancement
```typescript
declare class AIModels extends ModelCollection {
  // New method
  getProvider(providerId: string): Provider;  // Get provider info
}
```

### 2. Provider Interface
```typescript
interface Provider {
  id: string;
  name: string;
  websiteUrl: string;
  apiUrl: string;
  defaultModel?: string;
  isLocal?: number;
  models: Record<string, ModelPrice>;
}
```

## Usage Examples

### Model Discovery
```typescript
// Find a model
const model = models.id("deepseek-r1")

// Get provider info
const provider = models.getProvider("openai")

// Initialize in AIWrapper
const lang = Lang[provider.id]({ 
  apiKey, 
  model: model.id 
})

// Find models by criteria
const localModels = models.local()
const chatModels = models.can("chat")
const fastModels = models.withMinContext(32000)
```

## Implementation Notes

1. Collection Enhancement:
   - Add convenience methods for common filtering cases
   - Keep existing collection patterns
   - Maintain type safety

2. Provider Info:
   - Use existing provider data structure
   - Add any missing provider metadata

## Migration Strategy
1. Add new methods to ModelsCollection
2. Update documentation
3. Add examples showing the recommended patterns 