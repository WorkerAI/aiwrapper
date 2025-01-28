/**
 * Deno module entry point.
 * No need to build, Deno uses /src folder directly.
 * Npm package entry is in {@link /dist/npm-entry.js}.
 */

import { setHttpRequestImpl } from "./src/http-request.ts";

// Here we use Browser's Fetch API for http requests
setHttpRequestImpl((url: string | URL | Request, options: object): Promise<Response> => {
  return fetch(url, options);
});

export * from "./src/index.ts";