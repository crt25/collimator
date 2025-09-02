import { FunctionCallExpressionNode } from "./function-call-node";
import { LiteralNode } from "./literal-node";
import { OperatorNode } from "./operator-node";
import { ExpressionSequenceNode } from "./expression-sequence-node";
import { VariableNode } from "./variable-node";
import { VariableAssignmentExpressionNode } from "./assignment-node";
import { LambdaNode } from "./lambda-node";
export * from "./expression-node-base";
export * from "./expression-node-type";

export type ExpressionNode =
  | LiteralNode
  | FunctionCallExpressionNode
  | VariableNode
  | OperatorNode
  | ExpressionSequenceNode
  | VariableAssignmentExpressionNode
  | LambdaNode;

export type {
  FunctionCallExpressionNode as FunctionCallNode,
  LiteralNode,
  OperatorNode,
  VariableNode,
};
