let _encodeBase64 = (text: string): string => {
  throw new Error("Not implemented");
};

let _decodeBase64 = (text: string): string => {
  throw new Error("Not implemented");
};

let _encodeBytesToBase64 = (bytes: Uint8Array): string => {
  return btoa(String.fromCharCode(...bytes));
}

export const encodeBase64Impl = (impl: (text: string) => string) => {
  _encodeBase64 = impl;
};

export const decodeBase64Impl = (impl: (text: string) => string) => {
  _decodeBase64 = impl;
}

export const encodeBytesToBase64Impl = (impl: (bytes: Uint8Array) => string) => {
  _encodeBytesToBase64 = impl;
}

export const encodeBase64 = (text: string): string => {
  return _encodeBase64(text);
};

export const decodeBase64 = (text: string): string => {
  return _decodeBase64(text);
}

export const encodeBytesToBase64 = (bytes: Uint8Array): string => {
  return _encodeBytesToBase64(bytes);
}