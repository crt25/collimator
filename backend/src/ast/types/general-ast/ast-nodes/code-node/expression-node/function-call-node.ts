import { ExpressionNode } from ".";
import { ExpressionNodeBase } from "./expression-node-base";
import { ExpressionNodeType } from "./expression-node-type";

/**
 * A node representing a function call.
 * Note that any system, library or environment call may be
 * represented by a function node with a special name.
 */
export interface FunctionCallNode extends ExpressionNodeBase {
  expressionType: ExpressionNodeType.functionCall;

  name: string;
  arguments: ExpressionNode[];
}
