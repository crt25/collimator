import { ExpressionNode } from "../expression-node";
import { StatementNodeBase } from "./statement-node-base";
import { StatementNodeType } from "./statement-node-type";

/**
 * A node representing a variable declaration.
 */
export interface VariableDeclarationNode extends StatementNodeBase {
  codeType: StatementNodeType.variableDeclaration;

  type?: string;
  name: string;
  value: ExpressionNode;
}
