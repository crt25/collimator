import { ExpressionNode } from "../expression-node";
import { VariableNode } from "../expression-node/variable-node";
import { StatementNodeBase } from "./statement-node-base";
import { StatementNodeType } from "./statement-node-type";

/**
 * A node representing a value assignment to a variable.
 */
export interface VariableAssignmentNode extends StatementNodeBase {
  statementType: StatementNodeType.assignment;

  variable: VariableNode;
  value: ExpressionNode;
}
