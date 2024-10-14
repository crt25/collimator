import { ExpressionNode } from "../expression-node";
import { VariableNode } from "../expression-node/variable-node";
import { CodeNodeBase } from "./code-node-base";
import { CodeNodeType } from "./code-node-type";

/**
 * A node representing a value assignment to a variable.
 */
export interface VariableAssignmentNode extends CodeNodeBase {
  codeType: CodeNodeType.assignment;

  variable: VariableNode;
  value: ExpressionNode;
}
