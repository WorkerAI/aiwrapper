import { decodeBpe, encodeBpe, Tokenizer } from "../tokenizer.ts";
import { splitRegex, tokensBase64, tokensOffset } from "./encoding-claude.js";

const claudeTokensWithoutOffset = tokensBase64.split(" ");
const decodingBase64Arr: string[] = new Array(tokensOffset).fill("").concat(
  claudeTokensWithoutOffset,
);
const encodingBase64Map: Map<string, number> = new Map();
for (let i = 0; i < decodingBase64Arr.length; i++) {
  encodingBase64Map.set(decodingBase64Arr[i], i);
}

export class Tokenizer_claude implements Tokenizer {
  name = "claude";

  encode(text: string): number[] {
    // @TODO: replace with a legit BPE encoder after an optimization
    const tokensPerWords = 1.43;
    const words = text.split(" ");
    const encodedWords = new Array(Math.floor(words.length * tokensPerWords)).fill(0);
    return encodedWords;

    //return encodeBpe(text, encodingBase64Map/*, splitRegex*/);
  }

  decode(tokens: number[]): string {
    return decodeBpe(tokens, decodingBase64Arr);
  }
}
