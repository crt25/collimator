import { ExpressionNodeBase } from "./expression-node-base";
import { ExpressionNodeType } from "./expression-node-type";

/**
 * A node representing a literal of a given type
 * such as "true" of type "boolean" or "-1" of type "integer".
 */
export interface LiteralNode extends ExpressionNodeBase {
  expressionType: ExpressionNodeType.literal;

  type: string;
  value: string;
}
