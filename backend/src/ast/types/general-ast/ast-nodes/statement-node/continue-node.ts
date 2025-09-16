import { StatementNodeBase } from "./statement-node-base";
import { StatementNodeType } from "./statement-node-type";

/**
 * A node representing a continue statement.
 */
export interface ContinueNode extends StatementNodeBase {
  statementType: StatementNodeType.continue;
}
