let _httpRequest = async (url: string | URL, options: object): Promise<Response> => {
  throw new Error("Not implemented");
};

export const setHttpRequestImpl = (impl: (url: string | URL, options: object) => Promise<Response>) => {
  _httpRequest = impl;
};

export const httpRequest = (url: string | URL, options: object): Promise<Response> => {
  return _httpRequest(url, options);
};