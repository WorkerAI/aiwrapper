import { Tokenizer, Tokenizer_cl100k_base } from "./tokens/tokenizer.ts";

/**
 * Supported Language Models.
 */
export type LangModelNames = "gpt-4" | "gpt-4-32" | "gpt-3.5-turbo" | "gpt-3.5-turbo-16" | LangVecsModelNames;

export type LangVecsModelNames = "text-embedding-ada-002";

/**
 * Pricing per token for each model.
 * E.g gpt-4 costs 0.00003 per token for input and 0.00006 per token for output.
 * Note that $0.03 for 1000 tokens is $0.00003 **per token** (plus 2 zeros).
 */
export const langPricePerToken = new Map<string, [number, number]>([
  ['gpt-4', [0.00003, 0.00006]],
  ['gpt-4-32', [0.00006, 0.00012]],
  ['gpt-3.5-turbo', [0.0000015, 0.000002]],
  ['gpt-3.5-turbo-16', [0.000003, 0.000004]],
  ['text-embedding-ada-002', [0.0000001, 0]],
]);

export const getTokenizerBasedOnModel = (model: string): Tokenizer => {
  switch (model) {
    case 'gpt-4':
    case 'gpt-4-32':
    case 'gpt-3.5-turbo':
    case 'text-embedding-ada-002':
      return new Tokenizer_cl100k_base();
    default:
      throw new Error(`Unknown model: ${model}`);
  }
}