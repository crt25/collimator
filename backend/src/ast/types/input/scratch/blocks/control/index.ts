import { CreateCloneOfBlock } from "./create-clone-of";
import { CreateCloneOfMenuBlock } from "./create-clone-of-menu";
import { DeleteThisCloneBlock } from "./delete-this-clone";
import { ForeverBlock } from "./forever";
import { IfBlock } from "./if";
import { IfElseBlock } from "./if-else";
import { RepeatBlock } from "./repeat";
import { RepeatUntilBlock } from "./repeat-until";
import { StartAsCloneBlock } from "./start-as-clone-block";
import { StopBlock } from "./stop";
import { WaitBlock } from "./wait";
import { WaitUntilBlock } from "./wait-until";

export * from "./create-clone-of";
export * from "./delete-this-clone";
export * from "./forever";
export * from "./if";
export * from "./if-else";
export * from "./repeat";
export * from "./repeat-until";
export * from "./start-as-clone-block";
export * from "./stop";
export * from "./wait";
export * from "./wait-until";

export type ControlHatBlock = StartAsCloneBlock;

export type ControlStatementBlock =
  | CreateCloneOfBlock
  | DeleteThisCloneBlock
  | ForeverBlock
  | IfElseBlock
  | IfBlock
  | RepeatUntilBlock
  | RepeatBlock
  | StopBlock
  | WaitUntilBlock
  | WaitBlock;

export type ControlExpressionBlock = CreateCloneOfMenuBlock;
