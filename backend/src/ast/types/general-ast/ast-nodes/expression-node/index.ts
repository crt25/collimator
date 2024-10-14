import { VariableAssignmentNode } from "../code-node/assignment-node";
import { FunctionCallNode } from "./function-call-node";
import { LiteralNode } from "./literal-node";
import { OperatorNode } from "./operator-node";
import { VariableNode } from "./variable-node";
export * from "./expression-node-base";
export * from "./expression-node-type";

export type ExpressionNode =
  | LiteralNode
  | FunctionCallNode
  | VariableNode
  | VariableAssignmentNode
  | OperatorNode;

export {
  VariableAssignmentNode as AssignmentNode,
  FunctionCallNode,
  LiteralNode,
  OperatorNode,
  VariableNode,
};
