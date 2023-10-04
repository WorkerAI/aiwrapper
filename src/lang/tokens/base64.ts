let _encodeBase64 = (text: string): string => {
  throw new Error("Not implemented");
};

let _decodeBase64 = (text: string): string => {
  throw new Error("Not implemented");
};

export const encodeBase64Impl = (impl: (text: string) => string) => {
  _encodeBase64 = impl;
};

export const decodeBase64Impl = (impl: (text: string) => string) => {
  _decodeBase64 = impl;
}

export const encodeBase64 = (text: string): string => {
  return _encodeBase64(text);
};

export const decodeBase64 = (text: string): string => {
  return _decodeBase64(text);
}