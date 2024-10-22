import { Blob as BlobPolyfill } from "node:buffer";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
global.Blob = BlobPolyfill as any;
