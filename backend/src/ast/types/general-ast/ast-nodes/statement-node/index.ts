import { VariableAssignmentNode } from "./assignment-node";
import { ConditionNode } from "./condition-node";
import { VariableDeclarationNode } from "./declaration-node";
import { FunctionCallNode } from "./function-call-node";
import { FunctionDeclarationNode } from "./function-declaration-node";
import { LoopNode } from "./loop-node";
export * from "./statement-node-base";
export * from "./statement-node-type";

/**
 * A node representing a stement.
 */
export type StatementNode =
  | ConditionNode
  | FunctionDeclarationNode
  | LoopNode
  | VariableAssignmentNode
  | VariableDeclarationNode
  | VariableAssignmentNode
  | FunctionCallNode;

export {
  ConditionNode,
  FunctionDeclarationNode,
  LoopNode,
  VariableAssignmentNode,
  VariableDeclarationNode,
  FunctionCallNode,
};
