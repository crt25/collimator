import { ConditionNode } from "./condition-node";
import { FunctionCallNode } from "./function-call-node";
import { FunctionDeclarationNode } from "./function-declaration-node";
import { LoopNode } from "./loop-node";
export * from "./code-node-base";
export * from "./code-node-type";

/**
 * A node representing code.
 */
export type CodeNode =
  | ConditionNode
  | FunctionCallNode
  | FunctionDeclarationNode
  | LoopNode;

export { ConditionNode, FunctionCallNode, FunctionDeclarationNode, LoopNode };
