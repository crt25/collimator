import { ExpressionNodeBase } from "./expression-node-base";
import { ExpressionNode, ExpressionNodeType } from ".";

/**
 * An AST node representing a sequence of expressions.
 * Note that this is different from a tuple in that the expressions are not
 * forming a tuple together and are not related to each other.
 */
export interface ExpressionSequenceNode extends ExpressionNodeBase {
  expressionType: ExpressionNodeType.sequence;

  expressions: ExpressionNode[];
}
