import { ExpressionNode } from "../expression-node";
import { CodeNodeBase } from "./code-node-base";
import { CodeNodeType } from "./code-node-type";

/**
 * A node representing a variable declaration.
 */
export interface VariableDeclarationNode extends CodeNodeBase {
  codeType: CodeNodeType.variableDeclaration;

  type?: string;
  name: string;
  value: ExpressionNode;
}
