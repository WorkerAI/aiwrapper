import * as info from "../info.ts";
import { StructuredPrompt } from "./structured-prompt.ts";
import { Tokenizer } from "../tokens/tokenizer.ts";
import extractJSON from "./json/extract-json.ts";

/**
 * LanguageModel is an abstract class that represents a language model and
 * its basic functionality.
 */
export abstract class LanguageModel {
  readonly name: string;
  readonly tokenizer: Tokenizer;

  constructor(name: string) {
    this.name = name;
    this.tokenizer = info.getTokenizerBasedOnModel(name);
  }

  abstract ask(
    prompt: string,
    onResult: (result: LangResult) => void,
  ): Promise<string>;

  async askForJSON(
    structuredPrompt: StructuredPrompt,
    content: { [key: string]: string },
    onResult?: (result: LangResult) => void,
  ): Promise<unknown> {
    let out = null;
    let trialsLeft = 3;
    const trials = trialsLeft;
    let result: LangResult = {
      answer: "",
      totalTokens: 0,
      promptTokens: 0,
      totalCost: "0",
      finished: false,
    };

    while (trialsLeft > 0) {
      trialsLeft--;

      const answer = await this.ask(
        structuredPrompt.getTextPrompt(content),
        (r) => {
          onResult?.(r);
          result = r;
        },
      );
      out = extractJSON(answer);

      // Give it the correct JSON string. Before JSON extraction - the results may have been invalid JSON strings
      result.answer = JSON.stringify(out);

      // @TODO: validate it against the schema

      if (out !== null) {
        break;
      } else if (out === null && trialsLeft <= 0) {
        throw new Error(`Failed to parse JSON after ${trials} trials`);
      }
    }

    // Calling it one more time after parsing JSON to return a valid JSON string
    onResult?.(result);

    return out;
  }

  defaultCalcCost = (
    inTokens: number,
    outTokens: number,
  ): string => {
    let inPricePerToken = 0;
    let outPricePerToken = 0;

    if (info.langPricePerToken.has(this.name)) {
      [inPricePerToken, outPricePerToken] = info.langPricePerToken.get(
        this.name,
      ) as [number, number];
    } else {
      throw new Error(`Unknown model: ${this.name}`);
    }

    return (inTokens * inPricePerToken + outTokens * outPricePerToken).toFixed(
      10,
    );
  };
}

export type LangResult = {
  answer: string;
  totalTokens: number;
  promptTokens: number;
  totalCost: string;
  finished: boolean;
  // readonly abort: () => void;
  // durationMs: number;
};
