import { ExpressionNodeBase } from "./expression-node-base";
import { ExpressionNodeType } from "./expression-node-type";

/**
 * A node representing a reference to a variable.
 * The name may encode special variables
 * from environments like scratch, i.e. "SYSTEM::current_position" or simply
 * a user given variable name.
 */
export interface VariableNode extends ExpressionNodeBase {
  expressionType: ExpressionNodeType.variable;

  name: string;
}
