import { CodeSequenceNode } from "./code-sequence-node";
import { CodeNodeBase } from "./code-node-base";
import { CodeNodeType } from "./code-node-type";

/**
 * A node representing a function declaration.
 */
export interface FunctionDeclarationNode extends CodeNodeBase {
  codeType: CodeNodeType.functionDeclaration;

  name: string;

  parameterNames: string[];
  body: CodeSequenceNode;
}
