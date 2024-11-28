import { VariableAssignmentNode } from "./assignment-node";
import { ConditionNode } from "./condition-node";
import { VariableDeclarationNode } from "./declaration-node";
import { FunctionCallNode } from "./function-call-node";
import { FunctionDeclarationNode } from "./function-declaration-node";
import { LoopNode } from "./loop-node";
import { StatementSequenceNode } from "./statement-sequence-node";
export * from "./statement-node-base";
export * from "./statement-node-type";

/**
 * A node representing a statement.
 */
export type StatementNode =
  | ConditionNode
  | FunctionDeclarationNode
  | LoopNode
  | VariableAssignmentNode
  | VariableDeclarationNode
  | FunctionCallNode
  | StatementSequenceNode;

export type {
  ConditionNode,
  FunctionDeclarationNode,
  LoopNode,
  VariableAssignmentNode,
  VariableDeclarationNode,
  FunctionCallNode,
};
