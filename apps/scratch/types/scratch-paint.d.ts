/// <reference path="../node_modules/@turbowarp/types/types/scratch-paint.ts" />

import { type Reducer } from "redux";

declare module "scratch-paintXX" {
  export const ScratchPaintReducer: Reducer<unknown>;
}
