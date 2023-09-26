/**
 * Node package entry point
 */

import axios from 'axios';
import { Lang } from "./js_build/lang/index.js";
import { setHttpRequestImpl } from "./js_build/httpRequest.js";

// Here we use Axios to make HTTP requests
setHttpRequestImpl((url, options) => {
  const response = axios(url, options);
  return response;
});

export { Lang };


/*
import { Lang } from "./js_build/lang/index.js";
import { setHttpRequestImpl } from "./js_build/httpRequest.js";

let makeRequest;

if (typeof window === 'undefined') {
  // Node.js environment
  const axios = require('axios');
  makeRequest = (url, options) => {
    return axios(url, options);
  };
} else {
  // Browser environment
  makeRequest = async (url, options) => {
    const response = await fetch(url, options);
    return response.json();
  };
}

setHttpRequestImpl(makeRequest);

export { Lang };
*/