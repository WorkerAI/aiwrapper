/**
 * Node package entry point.
 * Make sure to build with "npm run build" and run from /js_build folder.
 * The compiled JS build goes to /js_build.
 */

// **NOTE**: we import with ".js" because this will work with compiled JS files, not
// the current source ".ts" files.
import { setHttpRequestImpl } from "./http-request.js";
import { setProcessResponseStreamImpl } from "./process-response-stream.js";
import processLinesFromStream from "./lang/process-lines-from-stream.js";
import { decodeBase64Impl, encodeBase64Impl } from "./lang/tokens/base64.ts";

let nodeFetch;
const isInNodeServer = typeof process !== 'undefined' && process.versions != null && process.versions.node != null;
if (isInNodeServer) {
  nodeFetch = await import('node-fetch').then(module => module.default);
}

// For HTTP calls from Node.
// Here we decide between "node-fetch" in NodeJS and a regular fetch in a browser to make HTTP requests
setHttpRequestImpl((url, options) => {
  if (isInNodeServer) {
    // Because NodeJS doesn't have browser's fetch yet
    return nodeFetch(url, options);
  }

  // A regular browser's fetch
  return fetch(url, options);
});

decodeBase64Impl((str) => {
  if (isInNodeServer) {
    // Because NodeJS doesn't have browser's atob yet
    return Buffer.from(str, 'base64').toString('binary');
  }

  // A regular browser's atob
  return atob(str);
});

encodeBase64Impl((str) => {
  if (isInNodeServer) {
    // Because NodeJS doesn't have browser's btoa yet
    return Buffer.from(str, 'binary').toString('base64');
  }

  // A regular browser's btoa
  return btoa(str);
});

if (isInNodeServer) {
  // For processing response streams from Node.
  setProcessResponseStreamImpl(async (response, onData) => {
    if (response.ok === false) {
      if (response.status === 401) {
        throw new Error(
          "API key is invalid. Please check your API key and try again.",
        );
      }
  
      throw new Error(
        `Response from server was not ok. Status code: ${response.status}.`,
      );
    }

    let rawData = "";
    const decoder = new TextDecoder("utf-8");
    
    const dataPromise = new Promise((resolve, reject) => {
      response.body.on('data', (chunk) => {
          rawData += decoder.decode(chunk);
          // Process each complete message (messages are divided by newlines)
          let lastIndex = rawData.lastIndexOf("\n");
          if (lastIndex > -1) {
              processLinesFromStream(rawData.slice(0, lastIndex), onData);
              rawData = rawData.slice(lastIndex + 1);
          }
      });

      response.body.on('end', () => {
          resolve();
      });

      response.body.on('error', (err) => {
          reject(err);
      });
    });

    await dataPromise;
  });
}

export * from "./lang/index.js";