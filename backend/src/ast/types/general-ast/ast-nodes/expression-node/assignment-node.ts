import {
  ExpressionNode,
  ExpressionNodeBase,
  ExpressionNodeType,
} from "../expression-node";
import { VariableNode } from "./variable-node";

/**
 * A node representing a value assignment to a variable.
 */
export interface VariableAssignmentExpressionNode extends ExpressionNodeBase {
  expressionType: ExpressionNodeType.assignment;

  variable: VariableNode;
  value: ExpressionNode;
}
