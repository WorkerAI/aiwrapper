/**
 * Deno module entry point
 */

import { Lang } from "./src/lang/index.ts";
import { setHttpRequestImpl } from "./src/httpRequest.ts";

// Here we use Browser's Fetch API
setHttpRequestImpl((url: string | URL | Request, options: object): Promise<Response> => {
  const response = fetch(url, options);
  return response;
});

export { Lang };