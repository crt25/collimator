import { ArbitraryFunctionCallBlock } from "./arbitrary-function-call-block";
import { ArbitraryHatBlock } from "./arbitrary-hat-block";
import { ArbitraryNoOpBlock } from "./arbitrary-no-op-block";

export type ExtensionHatBlock = ArbitraryHatBlock;

export type ExtensionStatementBlock =
  | ArbitraryFunctionCallBlock
  | ArbitraryNoOpBlock;

export type ExtensionExpressionBlock = never;
