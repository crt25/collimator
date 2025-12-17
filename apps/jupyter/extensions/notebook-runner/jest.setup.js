/* eslint-disable no-undef */
import { Blob as BlobPolyfill } from "node:buffer";
global.Blob = BlobPolyfill;
