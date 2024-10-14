import { EventListenerNode, ActorNode, CodeNode } from "./ast-nodes";
export * from "./ast-node-type";
export * from "./ast-node-base";

export type GeneralAst = CodeNode | ActorNode[] | EventListenerNode[];

export { ActorNode, CodeNode, EventListenerNode };
