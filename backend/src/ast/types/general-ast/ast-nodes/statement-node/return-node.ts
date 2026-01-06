import { ExpressionNode } from "../expression-node";
import { StatementNodeBase } from "./statement-node-base";
import { StatementNodeType } from "./statement-node-type";

/**
 * A node representing a return statement.
 */
export interface ReturnNode extends StatementNodeBase {
  statementType: StatementNodeType.return;

  value: ExpressionNode | null;
}
