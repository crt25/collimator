import { StatementNodeBase } from "./statement-node-base";
import { StatementNodeType } from "./statement-node-type";

/**
 * A node representing a break statement.
 */
export interface BreakNode extends StatementNodeBase {
  statementType: StatementNodeType.break;
}
