import {
  ControlCodeBlock,
  ControlExpressionBlock,
  ControlHatBlock,
} from "./control";
import { DataCodeBlock, DataExpressionBlock, DataHatBlock } from "./data";
import { EventCodeBlock, EventExpressionBlock, EventHatBlock } from "./event";
import { LooksCodeBlock, LooksExpressionBlock, LooksHatBlock } from "./looks";
import {
  MotionCodeBlock,
  MotionExpressionBlock,
  MotionHatBlock,
} from "./motion";
import {
  OperatorCodeBlock,
  OperatorExpressionBlock,
  OperatorHatBlock,
} from "./operator";
import {
  ProcedureCodeBlock,
  ProcedureExpressionBlock,
  ProcedureHatBlock,
} from "./procedure";
import {
  SensingCodeBlock,
  SensingExpressionBlock,
  SensingHatBlock,
} from "./sensing";
import { SoundCodeBlock, SoundExpressionBlock, SoundHatBlock } from "./sound";

/**
 * A hat block is a starting block for a script.
 * See https://en.scratch-wiki.info/wiki/Hat_Block.
 */
export type KnownBuiltinScratchHatBlock =
  | ControlHatBlock
  | DataHatBlock
  | EventHatBlock
  | LooksHatBlock
  | MotionHatBlock
  | OperatorHatBlock
  | ProcedureHatBlock
  | SensingHatBlock
  | SoundHatBlock;

export type KnownBuiltinScratchCodeBlock =
  | ControlCodeBlock
  | DataCodeBlock
  | EventCodeBlock
  | LooksCodeBlock
  | MotionCodeBlock
  | OperatorCodeBlock
  | ProcedureCodeBlock
  | SensingCodeBlock
  | SoundCodeBlock;

export type KnownBuiltinScratchExpressionBlock =
  | ControlExpressionBlock
  | DataExpressionBlock
  | EventExpressionBlock
  | LooksExpressionBlock
  | MotionExpressionBlock
  | OperatorExpressionBlock
  | ProcedureExpressionBlock
  | SensingExpressionBlock
  | SoundExpressionBlock;
