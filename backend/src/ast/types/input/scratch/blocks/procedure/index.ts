import { ArgumentBooleanBlock } from "./argument-boolean";
import { ArgumentStringNumberBlock } from "./argument-string-number";
import { CallBlock } from "./call";
import { DefinitionBlock } from "./definition";
import { PrototypeBlock } from "./prototype";

export * from "./argument-boolean";
export * from "./argument-string-number";
export * from "./call";
export * from "./definition";
export * from "./prototype";

export type ProcedureHatBlock = DefinitionBlock;

export type ProcedureCodeBlock = CallBlock | PrototypeBlock;

export type ProcedureExpressionBlock =
  | ArgumentBooleanBlock
  | ArgumentStringNumberBlock;
