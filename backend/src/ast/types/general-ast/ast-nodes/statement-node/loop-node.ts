import { StatementSequenceNode } from "./statement-sequence-node";
import { StatementNodeBase } from "./statement-node-base";
import { StatementNodeType } from "./statement-node-type";
import { ExpressionNode } from "../expression-node";

/**
 * A node representing a while loop executing the body as long as
 * the condition evaluates to true.
 */
export interface LoopNode extends StatementNodeBase {
  codeType: StatementNodeType.loop;

  condition: ExpressionNode;
  body: StatementSequenceNode;
}
