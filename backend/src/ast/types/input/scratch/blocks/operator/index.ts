import { AddBlock } from "./add";
import { AndBlock } from "./and";
import { ContainsBlock } from "./contains";
import { DivideBlock } from "./divide";
import { EqualsBlock } from "./equals";
import { GtBlock } from "./gt";
import { JoinBlock } from "./join";
import { LengthOfBlock } from "./length-of";
import { LetterOfBlock } from "./letter-of";
import { LtBlock } from "./lt";
import { ModBlock } from "./mod";
import { MultiplyBlock } from "./multiply";
import { NotBlock } from "./not";
import { OrBlock } from "./or";
import { RandomBlock } from "./random";
import { RoundBlock } from "./round";
import { SubtractBlock } from "./subtract";
import { MathOpBlock } from "./math-op";

export * from "./add";
export * from "./and";
export * from "./contains";
export * from "./divide";
export * from "./equals";
export * from "./gt";
export * from "./join";
export * from "./length-of";
export * from "./letter-of";
export * from "./lt";
export * from "./mod";
export * from "./multiply";
export * from "./not";
export * from "./or";
export * from "./random";
export * from "./round";
export * from "./subtract";
export * from "./math-op";

export type OperatorHatBlock = never;

export type OperatorStatementBlock = never;

export type OperatorExpressionBlock =
  | AddBlock
  | AndBlock
  | ContainsBlock
  | DivideBlock
  | EqualsBlock
  | GtBlock
  | JoinBlock
  | LengthOfBlock
  | LetterOfBlock
  | LtBlock
  | ModBlock
  | MultiplyBlock
  | NotBlock
  | OrBlock
  | RandomBlock
  | RoundBlock
  | SubtractBlock
  | MathOpBlock;
