import { CodeNode } from ".";
import { CodeNodeBase } from "./code-node-base";
import { CodeNodeType } from "./code-node-type";

/**
 * An AST node representing a code block consistinc of a sequence of code nodes.
 */
export interface CodeSequenceNode extends CodeNodeBase {
  codeType: CodeNodeType.sequence;

  statements: CodeNode[];
}
