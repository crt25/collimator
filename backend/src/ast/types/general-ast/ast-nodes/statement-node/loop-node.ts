import { ExpressionNode } from "../expression-node";
import { StatementSequenceNode } from "./statement-sequence-node";
import { StatementNodeBase } from "./statement-node-base";
import { StatementNodeType } from "./statement-node-type";

/**
 * A node representing a while loop executing the body as long as
 * the condition evaluates to true.
 */
export interface LoopNode extends StatementNodeBase {
  statementType: StatementNodeType.loop;

  condition: ExpressionNode | null;
  body: StatementSequenceNode;
}
