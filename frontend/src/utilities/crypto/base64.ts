export const encodeBase64 = (input: ArrayBuffer): string =>
  btoa(
    Array.from(new Uint8Array(input))
      .map((byte) => String.fromCharCode(byte).toString())
      .join(""),
  );

export const decodeBase64 = (input: string): ArrayBuffer =>
  Uint8Array.from(atob(input), (c) => c.charCodeAt(0));

export const encodeBase64Url = (input: ArrayBuffer): string =>
  encodeBase64(input).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");

export const decodeBase64Url = (input: string): ArrayBuffer =>
  decodeBase64(input.replace(/-/g, "+").replace(/_/g, "/"));
