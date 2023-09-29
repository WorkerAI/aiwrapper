import { encodeMap, decodeMap } from './encoding-cl100k_base.js';

export function encode(text: string): number[] {
  let encodedTokens = [];
  let start = 0;

  while (start < text.length) {
    let bestMatch = '';
    
    for (let end = start + 1; end <= text.length; end++) {
      let substr = text.slice(start, end);

      if (encodeMap.has(substr) && substr.length > bestMatch.length) {
        bestMatch = substr;
      }
    }
    
    if (bestMatch) {
      encodedTokens.push(encodeMap.get(bestMatch));
      start += bestMatch.length;
    } else {
      console.warn(`No match found for substring starting at index ${start}. Skipping one character.`);
      start += 1;
    }
  }
  
  return encodedTokens;
}

export function decode(encodedTokens: number[]): string {
  let text = '';

  for (let token of encodedTokens) {
    if (decodeMap.has(token)) {
      text += decodeMap.get(token);
    } else {
      throw new Error(`No match found for encoded token ${token}.`);
    }
  }

  return text;
}

export interface Tokenizer {
  readonly name: string;
  encode(text: string): number[];
  decode(tokens: number[]): string;
}

export class Tokenizer_cl100k_base implements Tokenizer {
  name = 'cl100k_base';

  encode(text: string): number[] {
    return encode(text);
  }

  decode(tokens: number[]): string {
    return decode(tokens);
  }
}
