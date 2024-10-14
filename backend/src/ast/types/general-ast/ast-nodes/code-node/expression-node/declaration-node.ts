import { ExpressionNode } from ".";
import { ExpressionNodeBase } from "./expression-node-base";
import { ExpressionNodeType } from "./expression-node-type";

/**
 * A node representing a variable declaration.
 */
export interface DeclarationNode extends ExpressionNodeBase {
  expressionType: ExpressionNodeType.variable;

  type?: string;
  name: string;
  value: ExpressionNode;
}
