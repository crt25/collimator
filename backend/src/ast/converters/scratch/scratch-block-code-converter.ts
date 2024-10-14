import {
  convertControlBlockTreeToCode,
  isControlCodeBlock,
} from "./scratch-control-block-converter";
import { ControlCodeBlock } from "src/ast/types/input/scratch/blocks/control";
import {
  convertDataBlockTreeToCode,
  isDataCodeBlock,
} from "./scratch-data-block-converter";
import { DataCodeBlock } from "src/ast/types/input/scratch/blocks/data";
import { EventCodeBlock } from "src/ast/types/input/scratch/blocks/event";
import {
  convertEventBlockTreeToCode,
  isEventCodeBlock,
} from "./scratch-event-block-converter";
import { LooksCodeBlock } from "src/ast/types/input/scratch/blocks/looks";
import {
  convertLooksBlockTreeToCode,
  isLooksCodeBlock,
} from "./scratch-looks-block-converter";
import { MotionCodeBlock } from "src/ast/types/input/scratch/blocks/motion";
import {
  convertMotionBlockTreeToCode,
  isMotionCodeBlock,
} from "./scratch-motion-block-converter";
import { ProcedureCodeBlock } from "src/ast/types/input/scratch/blocks/procedure";
import {
  isProcedureCodeBlock,
  convertProcedureBlockTreeToCode,
} from "./scratch-procedure-block-converter";
import { SensingCodeBlock } from "src/ast/types/input/scratch/blocks/sensing";
import {
  convertSensingBlockTreeToCode,
  isSensingCodeBlock,
} from "./scratch-sensing-block-converter";
import { SoundCodeBlock } from "src/ast/types/input/scratch/blocks/sound";
import {
  convertSoundBlockTreeToCode,
  isSoundCodeBlock,
} from "./scratch-sound-block-converter";
import { CodeBlockTree, NonHatBlockTree } from "./types";
import { CodeNode } from "src/ast/types/general-ast";
import { match, P } from "ts-pattern";

const convertSingleBlockTreeToCode = (codeBlock: CodeBlockTree): CodeNode[] =>
  match(codeBlock)
    .returnType<CodeNode[]>()
    .with(
      P.when(isControlCodeBlock),
      (block: ControlCodeBlock & NonHatBlockTree) =>
        convertControlBlockTreeToCode(block),
    )
    .with(P.when(isDataCodeBlock), (block: DataCodeBlock & NonHatBlockTree) =>
      convertDataBlockTreeToCode(block),
    )
    .with(P.when(isEventCodeBlock), (block: EventCodeBlock & NonHatBlockTree) =>
      convertEventBlockTreeToCode(block),
    )
    .with(P.when(isLooksCodeBlock), (block: LooksCodeBlock & NonHatBlockTree) =>
      convertLooksBlockTreeToCode(block),
    )
    .with(
      P.when(isMotionCodeBlock),
      (block: MotionCodeBlock & NonHatBlockTree) =>
        convertMotionBlockTreeToCode(block),
    )
    .with(
      P.when(isProcedureCodeBlock),
      (block: ProcedureCodeBlock & NonHatBlockTree) =>
        convertProcedureBlockTreeToCode(block),
    )
    .with(
      P.when(isSensingCodeBlock),
      (block: SensingCodeBlock & NonHatBlockTree) =>
        convertSensingBlockTreeToCode(block),
    )
    .with(P.when(isSoundCodeBlock), (block: SoundCodeBlock & NonHatBlockTree) =>
      convertSoundBlockTreeToCode(block),
    )
    .exhaustive();

export const convertBlockTreeToCode = (block: CodeBlockTree): CodeNode[] => {
  // iterate linked list of blocks in order
  // and convert them to a sequence of statements
  const statements: CodeNode[] = [];

  let nextBlock: CodeBlockTree | null = block;
  while (nextBlock) {
    statements.push(...convertSingleBlockTreeToCode(nextBlock));
    nextBlock = nextBlock.__next;
  }

  return statements;
};
