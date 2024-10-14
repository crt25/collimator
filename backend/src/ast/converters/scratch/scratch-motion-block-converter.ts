import { CodeNode } from "src/ast/types/general-ast/ast-nodes";
import { match, P } from "ts-pattern";
import { NonHatBlock, TreeNode } from "./types";
import {
  ChangeXByBlock,
  ChangeYByBlock,
  DirectionBlock,
  GlideToBlock,
  GlideToMenuBlock,
  GlideToXYBlock,
  GoToBlock,
  GoToMenuBlock,
  GoToXYBlock,
  IfOnEdgeBounceBlock,
  isChangeXByBlock,
  isChangeYByBlock,
  isDirectionBlock,
  isGlideToBlock,
  isGlideToMenuBlock,
  isGlideToXYBlock,
  isGoToBlock,
  isGoToMenuBlock,
  IsGoToXYBlock,
  isIfOnEdgeBounceBlock,
  isMoveStepsBlock,
  isPointInDirectionBlock,
  isPointTowardsBlock,
  isPointTowardsMenuBlock,
  isSetRotationStyleBlock,
  isSetXBlock,
  isSetYBlock,
  isTurnLeftBlock,
  isTurnRightBlock,
  isXPositionBlock,
  isYPositionBlock,
  MotionCodeBlock,
  MotionExpressionBlock,
  MoveStepsBlock,
  PointInDirectionBlock,
  PointTowardsBlock,
  PointTowardsMenuBlock,
  SetRotationStyleBlock,
  SetXBlock,
  SetYBlock,
  TurnLeftBlock,
  TurnRightBlock,
  XPositionBlock,
  YPositionBlock,
} from "src/ast/types/input/scratch/blocks/motion";
import {
  createFunctionCallBlock,
  createLiteralNode,
  createVariableExpressionBlock,
} from "./helpers";
import { ExpressionNode } from "src/ast/types/general-ast/ast-nodes/expression-node";

type MotionCodeTreeNode = MotionCodeBlock & TreeNode;
type MotionExpressionTreeNode = MotionExpressionBlock & TreeNode;

export const isMotionCodeBlock = (
  block: NonHatBlock,
): block is MotionCodeBlock & NonHatBlock =>
  isChangeXByBlock(block) ||
  isChangeYByBlock(block) ||
  isGlideToBlock(block) ||
  isGlideToXYBlock(block) ||
  isGoToBlock(block) ||
  IsGoToXYBlock(block) ||
  isIfOnEdgeBounceBlock(block) ||
  isMoveStepsBlock(block) ||
  isPointInDirectionBlock(block) ||
  isPointTowardsBlock(block) ||
  isSetRotationStyleBlock(block) ||
  isSetXBlock(block) ||
  isSetYBlock(block) ||
  isTurnLeftBlock(block) ||
  isTurnRightBlock(block);

export const isMotionExpressionBlock = (
  block: NonHatBlock,
): block is MotionExpressionBlock =>
  isGoToMenuBlock(block) ||
  isGlideToMenuBlock(block) ||
  isPointTowardsMenuBlock(block) ||
  isXPositionBlock(block) ||
  isYPositionBlock(block) ||
  isDirectionBlock(block);

export const convertMotionBlockTreeToCode = (
  motionBlock: MotionCodeTreeNode,
): CodeNode[] =>
  match(motionBlock)
    .returnType<CodeNode[]>()
    .with(
      P.when(isChangeXByBlock),
      P.when(isChangeYByBlock),
      P.when(isGlideToBlock),
      P.when(isGlideToXYBlock),
      P.when(isGoToBlock),
      P.when(IsGoToXYBlock),
      P.when(isIfOnEdgeBounceBlock),
      P.when(isMoveStepsBlock),
      P.when(isPointInDirectionBlock),
      P.when(isPointTowardsBlock),
      P.when(isSetRotationStyleBlock),
      P.when(isSetXBlock),
      P.when(isSetYBlock),
      P.when(isTurnLeftBlock),
      P.when(isTurnRightBlock),
      (
        block: (
          | ChangeXByBlock
          | ChangeYByBlock
          | GlideToBlock
          | GlideToXYBlock
          | GoToBlock
          | GoToXYBlock
          | IfOnEdgeBounceBlock
          | MoveStepsBlock
          | PointInDirectionBlock
          | PointTowardsBlock
          | SetRotationStyleBlock
          | SetXBlock
          | SetYBlock
          | TurnLeftBlock
          | TurnRightBlock
        ) &
          MotionCodeTreeNode,
      ) => [createFunctionCallBlock(block)],
    )
    .exhaustive();

export const convertMotionBlockTreeToExpression = (
  motionBlock: MotionExpressionTreeNode,
): ExpressionNode =>
  match(motionBlock)
    .returnType<ExpressionNode>()
    .with(
      P.when(isXPositionBlock),
      P.when(isYPositionBlock),
      P.when(isDirectionBlock),
      (
        block: (XPositionBlock | YPositionBlock | DirectionBlock) &
          MotionExpressionTreeNode,
      ) => createVariableExpressionBlock(block.opcode),
    )
    .with(
      P.when(isGoToMenuBlock),
      (block: GoToMenuBlock & MotionExpressionTreeNode) =>
        createLiteralNode("string", block.fields.TO[0] ?? ""),
    )
    .with(
      P.when(isGlideToMenuBlock),
      (block: GlideToMenuBlock & MotionExpressionTreeNode) =>
        createLiteralNode("string", block.fields.TO[0] ?? ""),
    )
    .with(
      P.when(isPointTowardsMenuBlock),
      (block: PointTowardsMenuBlock & MotionExpressionTreeNode) =>
        createLiteralNode("string", block.fields.TOWARDS[0] ?? ""),
    )
    .exhaustive();
