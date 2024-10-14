import { AstNodeBase } from "../../ast-node-base";
import { AstNodeType } from "../../ast-node-type";
import { ExpressionNodeType } from "./expression-node-type";

/**
 * A node representing a code expression.
 */
export interface ExpressionNodeBase extends AstNodeBase {
  nodeType: AstNodeType.expression;

  expressionType: ExpressionNodeType;
}
