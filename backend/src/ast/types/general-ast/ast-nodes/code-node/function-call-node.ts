import { CodeNodeBase } from "./code-node-base";
import { CodeNodeType } from "./code-node-type";
import { ExpressionNode } from "./expression-node";

/**
 * A node representing a function call.
 * Note that any system, library or environment call may be
 * represented by a function node with a special name.
 */
export interface FunctionCallNode extends CodeNodeBase {
  codeType: CodeNodeType.functionCall;

  name: string;
  arguments: ExpressionNode[];
}
