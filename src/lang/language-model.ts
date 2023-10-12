import * as info from "../info.ts";
import { buildPromptForGettingJSON, PromptForJSON } from "./prompt-for-json.ts";
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
    onResult: (result: LangResultWithString) => void,
  ): Promise<LangResultWithString>;

  abstract chat(
    messages: any,
    onResult: (result: LangResultWithString) => void,
  ): Promise<LangResultWithString>;

  async askForJSON(
    promptObj: PromptForJSON,
    onResult?: (result: LangResultWithObject) => void,
  ): Promise<LangResultWithObject> {
    let trialsLeft = 3;
    const trials = trialsLeft;
    const prompt = buildPromptForGettingJSON(promptObj);
    const result = new LangResultWithObject(
      prompt,
      this.tokenizer.encode(prompt).length,
    );

    while (trialsLeft > 0) {
      trialsLeft--;
      const res = await this.ask(
        prompt,
        (r) => {
          result.answer = r.answer;
          result.totalTokens = r.totalTokens;
          result.totalCost = r.totalCost;
          result.finished = r.finished;

          onResult?.(result);
        },
      );

      const jsonObj = extractJSON(res.answer);

      if (jsonObj !== null) {
        result.answerObj = jsonObj;
      }

      // @TODO: validate the object against the schema from exampleOutputs

      if (result.answerObj !== null) {
        break;
      } else if (result.answerObj === null && trialsLeft <= 0) {
        throw new Error(`Failed to parse JSON after ${trials} trials`);
      }
    }

    result.finished = true;

    // Calling it one more time after parsing JSON to return a valid JSON string
    onResult?.(result);

    return result;
  }

  defaultCalcCost = (
    inTokens: number,
    outTokens: number,
  ): string => {
    return langConstCalc(this.name, inTokens, outTokens);
  };
}

interface LangProcessingResult {
  prompt: string;
  totalTokens: number;
  promptTokens: number;
  totalCost: string;
  finished: boolean;
}

export class LangResultWithString implements LangProcessingResult {
  prompt: string;
  answer: string;
  totalTokens: number;
  promptTokens: number;
  totalCost = "0";
  finished = false;
  // durationMs: number;

  constructor(
    prompt: string,
    promptTokens: number,
  ) {
    this.prompt = prompt;
    this.answer = "";
    this.totalTokens = 0;
    this.promptTokens = promptTokens;
    this.finished;
  }

  toString(): string {
    return this.answer;
  }

  abort(): void {
    throw new Error("Not implemented yet");
  }
}

export class LangResultWithObject implements LangProcessingResult {
  answerObj: object = {};
  answer = "";
  prompt: string;
  totalTokens: number;
  promptTokens: number;
  totalCost = "0";
  finished = false;

  constructor(
    prompt: string,
    promptTokens: number,
  ) {
    this.prompt = prompt;
    this.totalTokens = 0;
    this.promptTokens = promptTokens;
    this.finished;
  }

  toString(): string {
    if (Object.keys(this.answerObj).length === 0) {
      return this.answer;
    }

    return JSON.stringify(this.answerObj);
  }
}

export type LangChatMessages = {
  role: string;
  content: string;
}[];


export class LangResultFromChat implements LangProcessingResult {
  prompt: string;
  answer: string;
  messages: LangChatMessages = [];
  totalTokens: number;
  promptTokens: number;
  totalCost = "0";
  finished = false;

  constructor(
    messages: LangChatMessages,
    promptTokens: number,
  ) {
    // The prompt is the latest message
    this.prompt = messages.length > 0 ? messages[messages.length - 1].content : "";
    this.answer = "";
    this.totalTokens = 0;
    this.promptTokens = promptTokens;
    this.finished;
  }

  toString(): string {
    return this.answer;
  }

  abort(): void {
    throw new Error("Not implemented yet");
  }
}
