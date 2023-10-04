import { Tokenizer, encodeWithBase64Map, decodeFromBase64Arr } from '../tokenizer.ts';
import { tokensBase64 } from './encoding-cl100k_base.js';

const decodingBase64Arr = tokensBase64.split(' ');
const encodingBase64Map: Map<string, number> = new Map();
for (let i = 0; i < decodingBase64Arr.length; i++) {
  encodingBase64Map.set(decodingBase64Arr[i], i);
}

export class Tokenizer_cl100k_base implements Tokenizer {
  name = 'cl100k_base';

  encode(text: string): number[] {
    return encodeWithBase64Map(text, encodingBase64Map);
  }

  decode(tokens: number[]): string {
    return decodeFromBase64Arr(tokens, decodingBase64Arr);
  }
}