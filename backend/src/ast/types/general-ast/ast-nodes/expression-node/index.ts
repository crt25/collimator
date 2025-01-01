import { FunctionCallExpressionNode } from "./function-call-node";
import { LiteralNode } from "./literal-node";
import { OperatorNode } from "./operator-node";
import { VariableNode } from "./variable-node";
export * from "./expression-node-base";
export * from "./expression-node-type";

export type ExpressionNode =
  | LiteralNode
  | FunctionCallExpressionNode
  | VariableNode
  | OperatorNode;

export type { FunctionCallExpressionNode as FunctionCallNode, LiteralNode, OperatorNode, VariableNode };
