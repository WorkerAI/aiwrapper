let makeHttpRequest = async (url: string | URL, options: object): Promise<Response> => {
  throw new Error("Not implemented");
};

export const setHttpRequestImpl = (impl: (url: string | URL, options: object) => Promise<Response>) => {
  makeHttpRequest = impl;
};

export const httpRequest = (url: string | URL, options: object): Promise<Response> => {
  return makeHttpRequest(url, options);
};