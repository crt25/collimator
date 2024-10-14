import { CodeNode } from "src/ast/types/general-ast/ast-nodes";
import { NonHatBlock, TreeNode } from "./types";
import {
  AddBlock,
  AndBlock,
  ContainsBlock,
  DivideBlock,
  EqualsBlock,
  GtBlock,
  isAddBlock,
  isAndBlock,
  isContainsBlock,
  isDivideBlock,
  isEqualsBlock,
  isGtBlock,
  IsJoinBlock,
  isLengthOfBlock,
  isLetterOfBlock,
  isLtBlock,
  isMathOpBlock,
  isModBlock,
  isMultiplyBlock,
  isNotBlock,
  isOrBlock,
  isRandomBlock,
  isRoundBlock,
  isSubtractBlock,
  JoinBlock,
  LengthOfBlock,
  LetterOfBlock,
  LtBlock,
  MathOpBlock,
  ModBlock,
  MultiplyBlock,
  NotBlock,
  OperatorCodeBlock,
  OperatorExpressionBlock,
  OrBlock,
  RandomBlock,
  RoundBlock,
  SubtractBlock,
} from "src/ast/types/input/scratch/blocks/operator";
import { match, P } from "ts-pattern";
import { ExpressionNode } from "src/ast/types/general-ast/ast-nodes/code-node/expression-node";
import { createOperatorExpressionBlock } from "./helpers";

type OperatorCodeTreeNode = OperatorCodeBlock & TreeNode;
type OperatorExpressionTreeNode = OperatorExpressionBlock & TreeNode;

export const isOperatorCodeBlock = (
  block: NonHatBlock,
): block is OperatorCodeTreeNode =>
  isAddBlock(block) ||
  isAndBlock(block) ||
  isContainsBlock(block) ||
  isDivideBlock(block) ||
  isEqualsBlock(block) ||
  isGtBlock(block) ||
  IsJoinBlock(block) ||
  isLengthOfBlock(block) ||
  isLetterOfBlock(block) ||
  isLtBlock(block) ||
  isModBlock(block) ||
  isMultiplyBlock(block) ||
  isNotBlock(block) ||
  isOrBlock(block) ||
  isRandomBlock(block) ||
  isRoundBlock(block) ||
  isSubtractBlock(block);

export const isOperatorExpressionBlock = (
  block: NonHatBlock,
): block is OperatorExpressionTreeNode =>
  isAddBlock(block) ||
  isAndBlock(block) ||
  isContainsBlock(block) ||
  isDivideBlock(block) ||
  isEqualsBlock(block) ||
  isGtBlock(block) ||
  IsJoinBlock(block) ||
  isLengthOfBlock(block) ||
  isLetterOfBlock(block) ||
  isLtBlock(block) ||
  isModBlock(block) ||
  isMultiplyBlock(block) ||
  isNotBlock(block) ||
  isOrBlock(block) ||
  isRandomBlock(block) ||
  isRoundBlock(block) ||
  isSubtractBlock(block) ||
  isMathOpBlock(block);

export const convertOperatorBlockTreeToCode = (
  _operatorBlock: OperatorCodeTreeNode,
): CodeNode[] => {
  throw new Error(
    "Operator blocks cannot be converted to code, only to expressions",
  );
};

export const convertOperatorBlockTreeToExpression = (
  operatorBlock: OperatorExpressionTreeNode,
): ExpressionNode =>
  match(operatorBlock)
    .returnType<ExpressionNode>()
    .with(
      P.when(isAddBlock),
      P.when(isAndBlock),
      P.when(isContainsBlock),
      P.when(isDivideBlock),
      P.when(isEqualsBlock),
      P.when(isGtBlock),
      P.when(IsJoinBlock),
      P.when(isLengthOfBlock),
      P.when(isLetterOfBlock),
      P.when(isLtBlock),
      P.when(isModBlock),
      P.when(isMultiplyBlock),
      P.when(isNotBlock),
      P.when(isOrBlock),
      P.when(isRandomBlock),
      P.when(isRoundBlock),
      P.when(isSubtractBlock),
      P.when(isMathOpBlock),
      (
        block: (
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
          | MathOpBlock
        ) &
          OperatorExpressionTreeNode,
      ) => createOperatorExpressionBlock(block),
    )
    .exhaustive();
