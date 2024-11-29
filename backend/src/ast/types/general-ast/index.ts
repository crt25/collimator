import { EventListenerNode, ActorNode, StatementNode } from "./ast-nodes";
import { ExpressionNode } from "./ast-nodes/expression-node";
export * from "./ast-node-type";
export * from "./ast-node-base";

export type GeneralAst = ActorNode[];

export type AstNode =
  | GeneralAst
  | ActorNode
  | StatementNode
  | ExpressionNode
  | EventListenerNode;

export type { ActorNode, StatementNode, EventListenerNode };
