import { CodeSequenceNode } from "./code-sequence-node";
import { CodeNodeBase } from "./code-node-base";
import { CodeNodeType } from "./code-node-type";
import { ExpressionNode } from "./expression-node";

/**
 * A node representing an if statement executing one of two branches
 * depending on whether a given condition evaluates to true or false.
 */
export interface ConditionNode extends CodeNodeBase {
  codeType: CodeNodeType.condition;

  condition: ExpressionNode | null;

  whenTrue: CodeSequenceNode;
  whenFalse: CodeSequenceNode;
}
