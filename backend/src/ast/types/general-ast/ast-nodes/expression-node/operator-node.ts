import { ExpressionNode } from ".";
import { ExpressionNodeBase } from "./expression-node-base";
import { ExpressionNodeType } from "./expression-node-type";

/**
 * A node representing an n-ary operator including binary operators like
 * equality, inequality, comparison, bitshift, power, addition, etc.
 * but also the ternary operator true ? 'a' : 'b'
 */
export interface OperatorNode extends ExpressionNodeBase {
  expressionType: ExpressionNodeType.operator;

  /**
   * A textual description of the operator.
   * May be a symbol or a word/sentence.
   */
  operator: string;

  /**
   * The operands provided to the operator.
   * Note that the order matters, 2 > 1 is not the same as 1 > 2.
   */
  operands: ExpressionNode[];
}
