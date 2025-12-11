/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-undef */
import { Blob as BlobPolyfill } from "node:buffer";
global.Blob = BlobPolyfill;
