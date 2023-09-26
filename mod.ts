/**
 * Deno module entry point
 * No need to build, it uses /src folder directly
 */

import { Lang } from "./src/lang/index.ts";
import { setHttpRequestImpl } from "./src/httpRequest.ts";

// Here we use Browser's Fetch API for http requests
setHttpRequestImpl((url: string | URL | Request, options: object): Promise<Response> => {
  return fetch(url, options);
});

export { Lang };