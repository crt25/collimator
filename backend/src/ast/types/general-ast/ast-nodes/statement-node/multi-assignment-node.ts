import { ExpressionNode } from "../expression-node";
import { StatementNodeBase } from "./statement-node-base";
import { StatementNodeType } from "./statement-node-type";

/**
 * A node representing a value multi-assignment to variables to support
 * complex assignments like 'first, *rest, last = range(100)'
 */
export interface MultiAssignmentNode extends StatementNodeBase {
  statementType: StatementNodeType.multiAssignment;

  assignmentExpressions: ExpressionNode[];
  values: ExpressionNode[];
}
