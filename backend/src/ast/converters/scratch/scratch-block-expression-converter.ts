import { ExpressionNode } from "src/ast/types/general-ast/ast-nodes/expression-node";
import { match, P } from "ts-pattern";
import { DataExpressionBlock } from "src/ast/types/input/scratch/blocks/data";
import { ControlExpressionBlock } from "src/ast/types/input/scratch/blocks/control";
import { EventExpressionBlock } from "src/ast/types/input/scratch/blocks/event";
import { LooksExpressionBlock } from "src/ast/types/input/scratch/blocks/looks";
import { MotionExpressionBlock } from "src/ast/types/input/scratch/blocks/motion";
import { OperatorExpressionBlock } from "src/ast/types/input/scratch/blocks/operator";
import { ProcedureExpressionBlock } from "src/ast/types/input/scratch/blocks/procedure";
import { SensingExpressionBlock } from "src/ast/types/input/scratch/blocks/sensing";
import { SoundExpressionBlock } from "src/ast/types/input/scratch/blocks/sound";
import { ExpressionBlockTree, NonHatBlockTree } from "./types";
import {
  convertControlBlockTreeToExpression,
  isControlExpressionBlock,
} from "./scratch-control-block-converter";
import {
  convertDataBlockTreeToExpression,
  isDataExpressionBlock,
} from "./scratch-data-block-converter";
import {
  convertEventBlockTreeToExpression,
  isEventExpressionBlock,
} from "./scratch-event-block-converter";
import {
  convertLooksBlockTreeToExpression,
  isLooksExpressionBlock,
} from "./scratch-looks-block-converter";
import {
  convertMotionBlockTreeToExpression,
  isMotionExpressionBlock,
} from "./scratch-motion-block-converter";
import {
  convertOperatorBlockTreeToExpression,
  isOperatorExpressionBlock,
} from "./scratch-operator-block-converter";
import {
  convertProcedureBlockTreeToExpression,
  isProcedureExpressionBlock,
} from "./scratch-procedure-block-converter";
import {
  convertSensingBlockTreeToExpression,
  isSensingExpressionBlock,
} from "./scratch-sensing-block-converter";
import {
  convertSoundBlockTreeToExpression,
  isSoundExpressionBlock,
} from "./scratch-sound-block-converter";
import { isExpressionBlock } from "./helpers";

export const convertBlockTreeToExpression = (
  block: NonHatBlockTree,
): ExpressionNode => {
  if (!isExpressionBlock(block)) {
    throw new Error(
      `expected expression block but got ${JSON.stringify(block)} instead`,
    );
  }

  return convertExpressionBlockTreeToExpression(block);
};

export const convertExpressionBlockTreeToExpression = (
  expressionBlock: ExpressionBlockTree,
): ExpressionNode =>
  match(expressionBlock)
    .returnType<ExpressionNode>()
    .with(
      P.when(isControlExpressionBlock),
      (block: ControlExpressionBlock & ExpressionBlockTree) =>
        convertControlBlockTreeToExpression(block),
    )
    .with(
      P.when(isDataExpressionBlock),
      (block: DataExpressionBlock & ExpressionBlockTree) =>
        convertDataBlockTreeToExpression(block),
    )
    .with(
      P.when(isEventExpressionBlock),
      (block: EventExpressionBlock & ExpressionBlockTree) =>
        convertEventBlockTreeToExpression(block),
    )
    .with(
      P.when(isLooksExpressionBlock),
      (block: LooksExpressionBlock & ExpressionBlockTree) =>
        convertLooksBlockTreeToExpression(block),
    )
    .with(
      P.when(isMotionExpressionBlock),
      (block: MotionExpressionBlock & ExpressionBlockTree) =>
        convertMotionBlockTreeToExpression(block),
    )
    .with(
      P.when(isOperatorExpressionBlock),
      (block: OperatorExpressionBlock & ExpressionBlockTree) =>
        convertOperatorBlockTreeToExpression(block),
    )
    .with(
      P.when(isProcedureExpressionBlock),
      (block: ProcedureExpressionBlock & ExpressionBlockTree) =>
        convertProcedureBlockTreeToExpression(block),
    )
    .with(
      P.when(isSensingExpressionBlock),
      (block: SensingExpressionBlock & ExpressionBlockTree) =>
        convertSensingBlockTreeToExpression(block),
    )
    .with(
      P.when(isSoundExpressionBlock),
      (block: SoundExpressionBlock & ExpressionBlockTree) =>
        convertSoundBlockTreeToExpression(block),
    )
    .exhaustive();
