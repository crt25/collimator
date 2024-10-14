import {
  convertControlBlockTreeToStatement,
  isControlStatementBlock,
} from "./scratch-control-block-converter";
import { ControlStatementBlock } from "src/ast/types/input/scratch/blocks/control";
import {
  convertDataBlockTreeToStatement,
  isDataStatementBlock,
} from "./scratch-data-block-converter";
import { DataStatementBlock } from "src/ast/types/input/scratch/blocks/data";
import { EventStatementBlock } from "src/ast/types/input/scratch/blocks/event";
import {
  convertEventBlockTreeToStatement,
  isEventStatementBlock,
} from "./scratch-event-block-converter";
import { LooksStatementBlock } from "src/ast/types/input/scratch/blocks/looks";
import {
  convertLooksBlockTreeToStatement,
  isLooksStatementBlock,
} from "./scratch-looks-block-converter";
import { MotionStatementBlock } from "src/ast/types/input/scratch/blocks/motion";
import {
  convertMotionBlockTreeToStatement,
  isMotionStatementBlock,
} from "./scratch-motion-block-converter";
import { ProcedureStatementBlock } from "src/ast/types/input/scratch/blocks/procedure";
import {
  isProcedureStatementBlock,
  convertProcedureBlockTreeToStatement,
} from "./scratch-procedure-block-converter";
import { SensingStatementBlock } from "src/ast/types/input/scratch/blocks/sensing";
import {
  convertSensingBlockTreeToStatement,
  isSensingStatementBlock,
} from "./scratch-sensing-block-converter";
import { SoundStatementBlock } from "src/ast/types/input/scratch/blocks/sound";
import {
  convertSoundBlockTreeToStatement,
  isSoundStatementBlock,
} from "./scratch-sound-block-converter";
import { StatementBlockTree, NonHatBlockTree } from "./types";
import { StatementNode } from "src/ast/types/general-ast";
import { match, P } from "ts-pattern";

const convertSingleBlockTreeToStatement = (
  statementBlock: StatementBlockTree,
): StatementNode[] =>
  match(statementBlock)
    .returnType<StatementNode[]>()
    .with(
      P.when(isControlStatementBlock),
      (block: ControlStatementBlock & NonHatBlockTree) =>
        convertControlBlockTreeToStatement(block),
    )
    .with(
      P.when(isDataStatementBlock),
      (block: DataStatementBlock & NonHatBlockTree) =>
        convertDataBlockTreeToStatement(block),
    )
    .with(
      P.when(isEventStatementBlock),
      (block: EventStatementBlock & NonHatBlockTree) =>
        convertEventBlockTreeToStatement(block),
    )
    .with(
      P.when(isLooksStatementBlock),
      (block: LooksStatementBlock & NonHatBlockTree) =>
        convertLooksBlockTreeToStatement(block),
    )
    .with(
      P.when(isMotionStatementBlock),
      (block: MotionStatementBlock & NonHatBlockTree) =>
        convertMotionBlockTreeToStatement(block),
    )
    .with(
      P.when(isProcedureStatementBlock),
      (block: ProcedureStatementBlock & NonHatBlockTree) =>
        convertProcedureBlockTreeToStatement(block),
    )
    .with(
      P.when(isSensingStatementBlock),
      (block: SensingStatementBlock & NonHatBlockTree) =>
        convertSensingBlockTreeToStatement(block),
    )
    .with(
      P.when(isSoundStatementBlock),
      (block: SoundStatementBlock & NonHatBlockTree) =>
        convertSoundBlockTreeToStatement(block),
    )
    .exhaustive();

export const convertBlockTreeToStatement = (
  block: StatementBlockTree,
): StatementNode[] => {
  // iterate linked list of blocks in order
  // and convert them to a sequence of statements
  const statements: StatementNode[] = [];

  let nextBlock: StatementBlockTree | null = block;
  while (nextBlock) {
    statements.push(...convertSingleBlockTreeToStatement(nextBlock));
    nextBlock = nextBlock.__next;
  }

  return statements;
};
