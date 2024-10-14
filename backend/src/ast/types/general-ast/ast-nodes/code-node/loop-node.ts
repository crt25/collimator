import { CodeSequenceNode } from "./code-sequence-node";
import { CodeNodeBase } from "./code-node-base";
import { CodeNodeType } from "./code-node-type";
import { ExpressionNode } from "../expression-node";

/**
 * A node representing a while loop executing the body as long as
 * the condition evaluates to true.
 */
export interface LoopNode extends CodeNodeBase {
  codeType: CodeNodeType.loop;

  condition: ExpressionNode;
  body: CodeSequenceNode;
}
