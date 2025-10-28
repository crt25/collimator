import { ExpressionNode } from "../expression-node";
import { StatementNodeBase } from "./statement-node-base";
import { StatementNodeType } from "./statement-node-type";

/**
 * A node representing an expression statement.
 */
export interface ExpressionAsStatementNode extends StatementNodeBase {
  statementType: StatementNodeType.expressionAsStatement;
  expression: ExpressionNode;
}
