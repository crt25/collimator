import { AstNodeBase } from "../ast-node-base";
import { AstNodeType } from "../ast-node-type";
import { FunctionDeclarationNode } from "./statement-node";
import { EventListenerNode } from "./event-listener-node";

/**
 * An AST node representing an actor who can react to events.
 * This can for instance be a program or a scratch target.
 */
export interface ActorNode extends AstNodeBase {
  nodeType: AstNodeType.actor;

  eventListeners: EventListenerNode[];

  functionDeclarations: FunctionDeclarationNode[];
}
