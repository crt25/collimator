import { StatementSequenceNode } from "./statement-sequence-node";
import { StatementNodeBase } from "./statement-node-base";
import { StatementNodeType } from "./statement-node-type";

/**
 * A node representing a function declaration.
 */
export interface FunctionDeclarationNode extends StatementNodeBase {
  statementType: StatementNodeType.functionDeclaration;

  name: string;

  parameterNames: string[];
  body: StatementSequenceNode;
}
