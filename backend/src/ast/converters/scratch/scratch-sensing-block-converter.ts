import { CodeNode } from "src/ast/types/general-ast/ast-nodes";
import { match, P } from "ts-pattern";
import { NonHatBlock, TreeNode } from "./types";
import {
  AnswerBlock,
  AskAndWaitBlock,
  ColorIsTouchingColorBlock,
  CurrentBlock,
  DaysSince2000Block,
  DistanceToBlock,
  DistanceToMenuBlock,
  isAnswerBlock,
  isAskAndWaitBlock,
  isColorIsTouchingColorBlock,
  isCurrentBlock,
  isDaysSince2000Block,
  isDistanceToBlock,
  isDistanceToMenuBlock,
  isKeyOptionsBlock,
  isKeyPressedBlock,
  isLoudnessBlock,
  isMouseDownBlock,
  isMouseXBlock,
  isMouseYBlock,
  isOfBlock,
  isOfObjectMenuBlock,
  isResetTimerBlock,
  isSetDragModeBlock,
  isTimerBlock,
  isTouchingColorBlock,
  isTouchingObjectBlock,
  isTouchingObjectMenuBlock,
  isUsernameBlock,
  KeyOptionsBlock,
  KeyPressedBlock,
  LoudnessBlock,
  MouseDownBlock,
  MouseXBlock,
  MouseYBlock,
  OfBlock,
  OfObjectMenuBlock,
  ResetTimerBlock,
  SensingCodeBlock,
  SensingExpressionBlock,
  SetDragModeBlock,
  TimerBlock,
  TouchingColorBlock,
  TouchingObjectBlock,
  TouchingObjectMenuBlock,
  UsernameBlock,
} from "src/ast/types/input/scratch/blocks/sensing";
import {
  createFunctionCallBlock,
  createFunctionCallExpressionBlock,
  createLiteralNode,
  createVariableExpressionBlock,
} from "./helpers";
import { ExpressionNode } from "src/ast/types/general-ast/ast-nodes/code-node/expression-node";

type SensingCodeTreeNode = SensingCodeBlock & TreeNode;
type SensingExpressionTreeNode = SensingExpressionBlock & TreeNode;

export const isSensingCodeBlock = (
  block: NonHatBlock,
): block is SensingCodeBlock & NonHatBlock =>
  isAskAndWaitBlock(block) ||
  isResetTimerBlock(block) ||
  isSetDragModeBlock(block);

export const isSensingExpressionBlock = (
  block: NonHatBlock,
): block is SensingExpressionTreeNode =>
  isTouchingObjectMenuBlock(block) ||
  isDistanceToMenuBlock(block) ||
  isKeyOptionsBlock(block) ||
  isOfObjectMenuBlock(block) ||
  isAnswerBlock(block) ||
  isColorIsTouchingColorBlock(block) ||
  isCurrentBlock(block) ||
  isDaysSince2000Block(block) ||
  isDistanceToBlock(block) ||
  isKeyPressedBlock(block) ||
  isLoudnessBlock(block) ||
  isMouseDownBlock(block) ||
  isMouseXBlock(block) ||
  isMouseYBlock(block) ||
  isOfBlock(block) ||
  isTimerBlock(block) ||
  isTouchingColorBlock(block) ||
  isTouchingObjectBlock(block) ||
  isUsernameBlock(block);

export const convertSensingBlockTreeToCode = (
  sensingBlock: SensingCodeTreeNode,
): CodeNode[] =>
  match(sensingBlock)
    .returnType<CodeNode[]>()
    .with(
      P.when(isAskAndWaitBlock),
      P.when(isResetTimerBlock),
      P.when(isSetDragModeBlock),
      (
        block: (AskAndWaitBlock | ResetTimerBlock | SetDragModeBlock) &
          SensingCodeTreeNode,
      ) => [createFunctionCallBlock(block)],
    )
    .exhaustive();

export const convertSensingBlockTreeToExpression = (
  sensingBlock: SensingExpressionTreeNode,
): ExpressionNode =>
  match(sensingBlock)
    .returnType<ExpressionNode>()
    .with(
      P.when(isColorIsTouchingColorBlock),
      P.when(isCurrentBlock),
      P.when(isDistanceToBlock),
      P.when(isKeyPressedBlock),
      P.when(isOfBlock),
      P.when(isTouchingColorBlock),
      P.when(isTouchingObjectBlock),

      (
        block: (
          | ColorIsTouchingColorBlock
          | CurrentBlock
          | DistanceToBlock
          | KeyPressedBlock
          | OfBlock
          | TouchingColorBlock
          | TouchingObjectBlock
        ) &
          SensingExpressionTreeNode,
      ) => createFunctionCallExpressionBlock(block),
    )
    .with(
      P.when(isAnswerBlock),
      P.when(isMouseXBlock),
      P.when(isMouseYBlock),
      P.when(isLoudnessBlock),
      P.when(isMouseDownBlock),
      P.when(isTimerBlock),
      P.when(isDaysSince2000Block),
      P.when(isUsernameBlock),
      (
        block: (
          | AnswerBlock
          | MouseXBlock
          | MouseYBlock
          | MouseDownBlock
          | LoudnessBlock
          | TimerBlock
          | DaysSince2000Block
          | UsernameBlock
        ) &
          SensingExpressionTreeNode,
      ) => createVariableExpressionBlock(block.opcode),
    )
    .with(
      P.when(isTouchingObjectMenuBlock),
      (block: TouchingObjectMenuBlock & SensingExpressionTreeNode) =>
        createLiteralNode("string", block.fields.TOUCHINGOBJECTMENU[0] ?? ""),
    )
    .with(
      P.when(isDistanceToMenuBlock),
      (block: DistanceToMenuBlock & SensingExpressionTreeNode) =>
        createLiteralNode("string", block.fields.DISTANCETOMENU[0] ?? ""),
    )
    .with(
      P.when(isKeyOptionsBlock),
      (block: KeyOptionsBlock & SensingExpressionTreeNode) =>
        createLiteralNode("string", block.fields.KEY_OPTION[0] ?? ""),
    )
    .with(
      P.when(isOfObjectMenuBlock),
      (block: OfObjectMenuBlock & SensingExpressionTreeNode) =>
        createLiteralNode("string", block.fields.OBJECT[0] ?? ""),
    )
    .exhaustive();
