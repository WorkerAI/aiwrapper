/**
 * Deno module entry point.
 * No need to build, Deno uses /src folder directly.
 * Node's entry is in {@link /js_build/node-entry.js} and uses a pre-built version of the npm package.
 */

import { setHttpRequestImpl } from "./src/http-request.ts";
import { encodeBase64Impl, decodeBase64Impl } from "./src/lang/tokens/base64.ts";

// Here we use Browser's Fetch API for http requests
setHttpRequestImpl((url: string | URL | Request, options: object): Promise<Response> => {
  return fetch(url, options);
});

import {
  decodeBase64,
  encodeBase64,
} from "https://deno.land/std@0.203.0/encoding/base64.ts";

decodeBase64Impl((str) => {
  const decodedArrayBuffer = decodeBase64(str);
  return new TextDecoder().decode(decodedArrayBuffer);
});

encodeBase64Impl((str) => {
  const textArrayBuffer = new TextEncoder().encode(str);
  return encodeBase64(textArrayBuffer);
});

export * from "./src/lang/index.ts";