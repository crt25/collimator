import { ConditionNode } from "./condition-node";
import { ExpressionNode } from "./expression-node";
import { FunctionDeclarationNode } from "./function-declaration-node";
import { LoopNode } from "./loop-node";
export * from "./code-node-base";
export * from "./code-node-type";

/**
 * A node representing code.
 */
export type CodeNode =
  | ConditionNode
  | FunctionDeclarationNode
  | LoopNode
  | ExpressionNode;

export { ConditionNode, FunctionDeclarationNode, LoopNode, ExpressionNode };
