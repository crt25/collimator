import { ExpressionNode } from "../expression-node";
import { CodeNodeBase } from "./code-node-base";
import { CodeNodeType } from "./code-node-type";

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
