import { Blob } from "node:buffer";
import { TextEncoder, TextDecoder } from "util";

Object.assign(global, { TextDecoder, TextEncoder, Blob });
