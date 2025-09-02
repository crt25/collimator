import { VariableAssignmentNode } from "./assignment-node";
import { BreakNode } from "./break-node";
import { ClassDeclarationNode } from "./class-declaration-node";
import { ConditionNode } from "./condition-node";
import { ContinueNode } from "./continue-node";
import { VariableDeclarationNode } from "./declaration-node";
import { ExpressionAsStatementNode } from "./expression-as-statement";
import { FunctionCallNode } from "./function-call-node";
import { FunctionDeclarationNode } from "./function-declaration-node";
import { LoopNode } from "./loop-node";
import { MultiAssignmentNode } from "./multi-assignment-node";
import { ReturnNode } from "./return-node";
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
  | StatementSequenceNode
  | MultiAssignmentNode
  | ReturnNode
  | ContinueNode
  | BreakNode
  | ExpressionAsStatementNode
  | ClassDeclarationNode;

export type {
  ConditionNode,
  FunctionDeclarationNode,
  LoopNode,
  VariableAssignmentNode,
  VariableDeclarationNode,
  FunctionCallNode,
};
