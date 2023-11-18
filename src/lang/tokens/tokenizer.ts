import { decodeBase64, encodeBytesToBase64 } from "./base64.ts";

export interface Tokenizer {
  readonly name: string;
  encode(text: string): number[];
  decode(tokens: number[]): string;
}

export function encodeBpe(input: string, mergeableRanks: Map<string, number>): number[] {
  const encoder = new TextEncoder();
  const uint8array = encoder.encode(input);

  let parts: Uint8Array[] = Array.from(uint8array).map(b => new Uint8Array([b]));

  while (true) {
    let minIdx: number | null = null;
    let minRank: number | null = null;

    for (let i = 0; i < parts.length - 1; i++) {
      const pair = new Uint8Array([...parts[i], ...parts[i + 1]]);
      const rank = mergeableRanks.get(encodeBytesToBase64(pair));

      if (rank !== undefined && (minRank === null || rank < minRank)) {
        minIdx = i;
        minRank = rank;
      }
    }

    if (minRank === null) {
      break;
    }

    if (minIdx !== null) {
      const merged = new Uint8Array([...parts[minIdx], ...parts[minIdx + 1]]);
      parts = [...parts.slice(0, minIdx), merged, ...parts.slice(minIdx + 2)];
    }
  }

  const tokens: number[] = parts.map(part => mergeableRanks.get(encodeBytesToBase64(part)) || 0);
  return tokens;
}

export function decodeBpe(
  encodedTokens: number[],
  decodeArr: string[],
): string {
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
