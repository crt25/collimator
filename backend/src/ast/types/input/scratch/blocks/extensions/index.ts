import { ArbitraryFunctionCallBlock } from "./arbitrary-function-call-block";
import { ArbitraryNoOpBlock } from "./arbitrary-no-op-block";

export type LooksHatBlock = never;

export type ExtensionStatementBlock =
  | ArbitraryFunctionCallBlock
  | ArbitraryNoOpBlock;

export type ExtensionExpressionBlock = never;
