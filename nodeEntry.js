/**
 * Node package entry point
 * Make sure to build the JS first with: npm run build
 */

import { Lang } from "./js_build/lang/index.js";
import { setHttpRequestImpl } from "./js_build/httpRequest.js";
import fetch from "node-fetch";

// Here we use "node-fetch" to make HTTP requests (same API as in the browser or Deno)
setHttpRequestImpl((url, options) => {
  debugger;
  return fetch(url, options);
});

export { Lang };