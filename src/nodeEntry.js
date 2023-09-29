/**
 * Node package entry point.
 * Make sure to build with "npm run build" and run from /js_build folder.
 * The compiled JS build goes to /js_build.
 */

// **NOTE**: we import with ".js" because this will work with compiled JS files, not
// the current source ".ts" files.
import { setHttpRequestImpl } from "./httpRequest.js";
import { setProcessResponseStreamImpl } from "./processResponseStream.js";
import processLinesFromStream from "./lang/processLinesFromStream.js";

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

if (isInNodeServer) {
  // For processing response streams from Node.
  setProcessResponseStreamImpl(async (response, onData) => {
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


export * from from "./lang/index.js";