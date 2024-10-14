import { StatementSequenceNode } from "./statement-sequence-node";
import { StatementNodeBase } from "./statement-node-base";
import { StatementNodeType } from "./statement-node-type";
import { ExpressionNode } from "../expression-node";

/**
 * A node representing an if statement executing one of two branches
 * depending on whether a given condition evaluates to true or false.
 */
export interface ConditionNode extends StatementNodeBase {
  codeType: StatementNodeType.condition;

  condition: ExpressionNode | null;

  whenTrue: StatementSequenceNode;
  whenFalse: StatementSequenceNode;
}
