import { LangChatMessages } from "../language-model.ts";
import { Model } from "aimodels";

// Rough estimate: 1 token ≈ 4 chars for English text
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Calculate the maximum number of tokens available for model response
 * based on the model's context window, input messages, and optional user limit
 */
export function calculateModelResponseTokens(
  modelInfo: Model,
  messages: LangChatMessages,
  userMaxTokens?: number
): number {
  // Calculate estimated tokens in messages
  const estimatedInputTokens = messages.reduce((total, msg) => {
    return total + estimateTokens(msg.content);
  }, 0);

  // Add some overhead for message formatting (roles, etc)
  const overhead = messages.length * 4;

  // Calculate available tokens based on model's context window
  const availableTokens = modelInfo.context.total - estimatedInputTokens - overhead;

  // Get the smallest of:
  // 1. Available tokens (what's left in context window)
  // 2. Model's max output capability
  // 3. User-specified limit (if any)
  const maxTokens = userMaxTokens
    ? Math.min(availableTokens, modelInfo.context.maxOutput, userMaxTokens)
    : Math.min(availableTokens, modelInfo.context.maxOutput);

  return maxTokens;
} 