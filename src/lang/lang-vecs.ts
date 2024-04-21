import { OpenAILangOptions, OpenAILangVecs } from "./openai/openai-lang-vecs.ts";

export class LangVecs {
  static openai(options: OpenAILangOptions): OpenAILangVecs {
    return new OpenAILangVecs(options);
  }
}

export interface LangVecsModel {
  readonly name: string;
  ask(prompt: string, onResult: (result: LangVecsResult) => void): Promise<number[]>;
}

export type LangVecsResult = {
  vector: number[];
}
