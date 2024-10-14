import { CodeNodeBase } from "../code-node-base";
import { CodeNodeType } from "../code-node-type";
import { ExpressionNodeType } from "./expression-node-type";

/**
 * A node representing a code expression.
 */
export interface ExpressionNodeBase extends CodeNodeBase {
  codeType: CodeNodeType.expression;

  expressionType: ExpressionNodeType;
}
