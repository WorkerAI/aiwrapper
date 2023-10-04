import { encodeBase64, decodeBase64 } from "./base64.ts";

export interface Tokenizer {
  readonly name: string;
  encode(text: string): number[];
  decode(tokens: number[]): string;
}

export function encode(text: string, encodeMap: Map<string, number>): number[] {
  let encodedTokens = [];
  let start = 0;

  while (start < text.length) {
    let bestMatch = "";

    for (let end = start + 1; end <= text.length; end++) {
      let substr = text.slice(start, end);

      if (encodeMap.has(substr) /* && substr.length > bestMatch.length*/) {
        bestMatch = substr;
      }
    }

    if (bestMatch) {
      encodedTokens.push(encodeMap.get(bestMatch));
      start += bestMatch.length;
    } else {
      console.warn(
        `No match found for substring starting at index ${start}. Skipping one character.`,
      );
      start += 1;
    }
  }

  return encodedTokens;
}

export function encodeWithBase64Map(
  fullText: string,
  encodeMap: Map<string, number>,
  splitRegex?: RegExp,
): number[] {
  let splitText = [fullText];

  if (splitRegex !== undefined) {
    const splitMatch = fullText.match(splitRegex);
    if (splitMatch === null) {
      throw new Error("Regex didn't match.");
    }
    splitText = splitMatch.map((token) => token);
  }

  const encodedTokens = [];

  for (let i = 0; i < splitText.length; i++) {
    const text = splitText[i];
    let start = 0;

    while (start < text.length) {
      let bestMatch = "";
      let bestMatchBase64 = "";

      for (let end = start + 1; end <= text.length; end++) {
        const substr = text.slice(start, end);
        const substrBase64 = encodeBase64(substr);

        if (encodeMap.has(substrBase64)) {
          bestMatchBase64 = substrBase64;
          bestMatch = substr;
        }
      }

      if (bestMatchBase64) {
        encodedTokens.push(encodeMap.get(bestMatchBase64));
        start += bestMatch.length;
      } else {
        console.warn(
          `No match found for substring starting at index ${start}. Skipping one character.`,
        );
        start += 1;
      }
    }
  }

  return encodedTokens;
}

export function decode(encodedTokens: number[], decodeArr: string[]): string {
  let text = "";

  for (let token of encodedTokens) {
    try {
      text += decodeArr[token];
    } catch (error) {
      console.error(`Didn't find a match for a token ${token}.`);
    }
  }

  return text;
}

encode

export function decodeFromBase64Arr(encodedTokens: number[], decodeArr: string[]): string {
  let text = "";

  for (const token of encodedTokens) {
    try {
      const base64Str = decodeArr[token];
      const decodedText = decodeBase64(base64Str);
      text += decodedText;
    } catch (_) {
      console.error(`Didn't find a match for a token ${token}.`);
    }
  }

  return text;
}
