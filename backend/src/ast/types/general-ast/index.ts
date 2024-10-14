import { EventListenerNode, ActorNode, StatementNode } from "./ast-nodes";
export * from "./ast-node-type";
export * from "./ast-node-base";

export type GeneralAst = ActorNode[];

export { ActorNode, StatementNode, EventListenerNode };
