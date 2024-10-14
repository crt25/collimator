import { StatementNode } from "src/ast/types/general-ast/ast-nodes";
import { match, P } from "ts-pattern";
import { NonHatBlock, TreeNode } from "./types";
import {
  BroadcastAndWaitBlock,
  BroadcastBlock,
  EventCodeBlock,
  EventExpressionBlock,
  isBroadcastAndWaitBlock,
  isBroadcastBlock,
} from "src/ast/types/input/scratch/blocks/event";
import { createFunctionCallBlock, createLiteralNode } from "./helpers";
import { ExpressionNode } from "src/ast/types/general-ast/ast-nodes/expression-node";
import {
  BroadcastMenuBlock,
  isBroadcastMenuBlock,
} from "src/ast/types/input/scratch/blocks/event/broadcast-menu";

type EventCodeTreeNode = EventCodeBlock & TreeNode;
type EventExpressionTreeNode = EventExpressionBlock & TreeNode;

export const isEventCodeBlock = (block: NonHatBlock): block is EventCodeBlock =>
  isBroadcastAndWaitBlock(block) || isBroadcastBlock(block);

export const isEventExpressionBlock = (
  block: NonHatBlock,
): block is EventExpressionTreeNode => false;

export const convertEventBlockTreeToCode = (
  eventBlock: EventCodeTreeNode,
): StatementNode[] =>
  match(eventBlock)
    .returnType<StatementNode[]>()
    .with(
      P.when(isBroadcastAndWaitBlock),
      P.when(isBroadcastBlock),
      (block: (BroadcastAndWaitBlock | BroadcastBlock) & EventCodeTreeNode) => [
        createFunctionCallBlock(block),
      ],
    )
    .exhaustive();

export const convertEventBlockTreeToExpression = (
  eventBlock: EventExpressionTreeNode,
): ExpressionNode =>
  match(eventBlock)
    .returnType<ExpressionNode>()
    .with(
      P.when(isBroadcastMenuBlock),
      (block: BroadcastMenuBlock & EventExpressionTreeNode) =>
        createLiteralNode("string", block.fields.BROADCAST_OPTION[0] ?? ""),
    )
    .exhaustive();
