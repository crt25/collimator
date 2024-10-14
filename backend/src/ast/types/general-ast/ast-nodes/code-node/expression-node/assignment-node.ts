import { ExpressionNode } from ".";
import { ExpressionNodeBase } from "./expression-node-base";
import { ExpressionNodeType } from "./expression-node-type";
import { VariableNode } from "./variable-node";

/**
 * A node representing a value assignment to a variable.
 */
export interface AssignmentNode extends ExpressionNodeBase {
  expressionType: ExpressionNodeType.assignment;

  variable: VariableNode;
  value: ExpressionNode;
}
