export const encodeBase64 = (input: ArrayBuffer | Uint8Array): string =>
  btoa(
    Array.from(new Uint8Array(input))
      .map((byte) => String.fromCharCode(byte).toString())
      .join(""),
  );

export const decodeBase64 = (input: string): Uint8Array<ArrayBuffer> =>
  Uint8Array.from(atob(input), (c) => c.charCodeAt(0));

export const encodeBase64Url = (input: Uint8Array | ArrayBuffer): string =>
  encodeBase64(input).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");

export const decodeBase64Url = (input: string): Uint8Array<ArrayBuffer> =>
  decodeBase64(input.replace(/-/g, "+").replace(/_/g, "/"));
