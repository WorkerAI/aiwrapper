import { Tokenizer, encodeWithBase64Map, decodeFromBase64Arr } from '../tokenizer.ts';
import { tokensBase64, tokensOffset, splitRegex } from './encoding-claude.js';

const claudeTokensWithoutOffset = tokensBase64.split(' ');
const decodingBase64Arr: string[] = new Array(tokensOffset).fill('').concat(claudeTokensWithoutOffset);
const encodingBase64Map: Map<string, number> = new Map();
for (let i = 0; i < decodingBase64Arr.length; i++) {
  encodingBase64Map.set(decodingBase64Arr[i], i);
}

export class Tokenizer_claude implements Tokenizer {
  name = 'claude';

  encode(text: string): number[] {
    return encodeWithBase64Map(text, encodingBase64Map, splitRegex);
  }

  decode(tokens: number[]): string {
    return decodeFromBase64Arr(tokens, decodingBase64Arr);
  }
}