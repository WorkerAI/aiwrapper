/**
 * Deno module entry point.
 * No need to build, Deno uses /src folder directly.
 * Node's entry is in {@link /js_build/node-entry.js} and uses a pre-built version of the npm package.
 */

import { setHttpRequestImpl } from "./src/http-request.ts";

// Here we use Browser's Fetch API for http requests
setHttpRequestImpl((url: string | URL | Request, options: object): Promise<Response> => {
  return fetch(url, options);
});

export * from "./src/lang/index.ts";