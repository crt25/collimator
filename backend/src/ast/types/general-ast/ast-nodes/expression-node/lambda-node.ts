import { StatementSequenceNode } from "../statement-node/statement-sequence-node";
import { ExpressionNodeBase } from "./expression-node-base";
import { ExpressionNodeType } from "./expression-node-type";
import { ExpressionNode } from ".";

/**
 * A node representing a function declaration.
 */
export interface LambdaNode extends ExpressionNodeBase {
  expressionType: ExpressionNodeType.lambda;

  parameterNames: string[];
  decorators?: ExpressionNode[];
  body: StatementSequenceNode;
}
