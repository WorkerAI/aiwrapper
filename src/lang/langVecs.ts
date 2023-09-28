import { OpenAILangOptions, OpenAILangVecs } from "./openai/openAILangVecs.ts";

export class LangVecs {
  static openai(options: OpenAILangOptions): OpenAILangVecs {
    return new OpenAILangVecs(options);
  }
}

export interface LangVecsModel {
  readonly name: string;
  ask(prompt: string, onResult: (result: LangVecsResult) => void): Promise<number[]>;
  _defaultCalcCost(inTokens: number): string;
}

export type LangVecsResult = {
  vector: number[];
  promptTokens: number;
  totalPrice: string;
}