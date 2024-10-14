import { AssignmentNode } from "./assignment-node";
import { DeclarationNode } from "./declaration-node";
import { FunctionCallNode } from "./function-call-node";
import { LiteralNode } from "./literal-node";
import { OperatorNode } from "./operator-node";
import { VariableNode } from "./variable-node";
export * from "./expression-node-base";
export * from "./expression-node-type";

export type ExpressionNode =
  | LiteralNode
  | DeclarationNode
  | FunctionCallNode
  | VariableNode
  | AssignmentNode
  | OperatorNode;

export {
  AssignmentNode,
  DeclarationNode,
  FunctionCallNode,
  LiteralNode,
  OperatorNode,
  VariableNode,
};
