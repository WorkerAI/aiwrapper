let _httpRequest = async (
  url: string | URL,
  options: object,
): Promise<Response> => {
  throw new Error("Not implemented");
};

export const setHttpRequestImpl = (
  impl: (url: string | URL, options: object) => Promise<Response>,
) => {
  _httpRequest = impl;
};

export const httpRequest = (
  url: string | URL,
  options: object,
): Promise<Response> => {
  return _httpRequest(url, options);
};

export const httpRequestWithRetry = async (
  url: string | URL,
  options: object,
  retries = 6,
  backoffMs = 100,
): Promise<Response> => {
  try {
    const response = await httpRequest(url, options);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response;
  } catch (error) {
    if (retries > 0) {
      await new Promise((resolve) => setTimeout(resolve, backoffMs));
      return httpRequestWithRetry(url, options, retries - 1, backoffMs * 2);
    } else {
      throw error;
    }
  }
};
