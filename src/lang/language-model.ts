import * as info from "../info.ts";
import { PromptForJSON, buildPromptForGettingJSON } from "./prompt-for-json.ts";
import { Tokenizer } from "../lang/tokens/tokenizer.ts";
import extractJSON from "./json/extract-json.ts";
import langConstCalc from "./lang-cost-calc.ts";

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
  ): Promise<LangResult>;

  async askForJSON(
    promptObj: PromptForJSON,
    onResult?: (result: LangResult) => void,
  ): Promise<unknown> {
    let out = null;
    let trialsLeft = 3;
    const trials = trialsLeft;
    const prompt = buildPromptForGettingJSON(promptObj);
    let result: LangResult = {
      prompt: "",
      answer: "",
      totalTokens: 0,
      promptTokens: 0,
      totalCost: "0",
      finished: false,
    };

    while (trialsLeft > 0) {
      trialsLeft--;
      const answer = await this.ask(
        prompt,
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
    return langConstCalc(this.name, inTokens, outTokens);
  };
}

export class LangResult {
  prompt: string;
  answer: string | object;
  totalTokens: number;
  promptTokens: number;
  totalCost: string = "0";
  finished: boolean = false;
  // durationMs: number;

  constructor(
    prompt: string,
    promptTokens: number,
  ) {
    this.prompt = prompt;
    this.answer = "";
    this.totalTokens = 0;
    this.promptTokens = promptTokens;
    this.totalCost = totalCost;
    this.finished;
  }

  toString(): string {
    if (typeof this.answer === "string") {
      return this.answer;
    }

    return JSON.stringify(this.answer);
  }

  abort(): void {
    throw new Error("Not implemented yet");
  }
}
