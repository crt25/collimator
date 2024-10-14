import {
  ControlStatementBlock,
  ControlExpressionBlock,
  ControlHatBlock,
} from "./control";
import { DataStatementBlock, DataExpressionBlock, DataHatBlock } from "./data";
import {
  EventStatementBlock,
  EventExpressionBlock,
  EventHatBlock,
} from "./event";
import {
  LooksStatementBlock,
  LooksExpressionBlock,
  LooksHatBlock,
} from "./looks";
import {
  MotionStatementBlock,
  MotionExpressionBlock,
  MotionHatBlock,
} from "./motion";
import {
  OperatorStatementBlock,
  OperatorExpressionBlock,
  OperatorHatBlock,
} from "./operator";
import {
  ProcedureStatementBlock,
  ProcedureExpressionBlock,
  ProcedureHatBlock,
} from "./procedure";
import {
  SensingStatementBlock,
  SensingExpressionBlock,
  SensingHatBlock,
} from "./sensing";
import {
  SoundStatementBlock,
  SoundExpressionBlock,
  SoundHatBlock,
} from "./sound";

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

export type KnownBuiltinScratchStatementBlock =
  | ControlStatementBlock
  | DataStatementBlock
  | EventStatementBlock
  | LooksStatementBlock
  | MotionStatementBlock
  | OperatorStatementBlock
  | ProcedureStatementBlock
  | SensingStatementBlock
  | SoundStatementBlock;

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
