import { AstNodeBase } from "../ast-node-base";
import { AstNodeType } from "../ast-node-type";
import { StatementSequenceNode } from "./statement-node/statement-sequence-node";
import { ExpressionNode } from "./expression-node";

/**
 * The condition when the event reaction is to be executed.
 */
export interface EventCondition {
  /**
   * A textual description of the event.
   * This may be "main" / "entrypoint" for a C program
   * or "green-flag" for scratch.
   */
  event: string;

  /**
   * Descriptions of the parameters belonging to the event.
   * Note that the order of parameters is important here.
   * This may be the set of parameters passed to an executable for a C program
   * or the parameters belonging to a given scratch event.
   */
  parameters: ExpressionNode[];
}

/**
 * An AST node representing a reaction to an event.
 */
export interface EventListenerNode extends AstNodeBase {
  nodeType: AstNodeType.eventListener;

  condition: EventCondition;
  action: StatementSequenceNode;
}
