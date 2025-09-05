import { ExpressionNode } from "../expression-node";
import { StatementSequenceNode } from "./statement-sequence-node";
import { StatementNodeBase } from "./statement-node-base";
import { StatementNodeType } from "./statement-node-type";

/**
 * A node representing a class declaration.
 */
export interface ClassDeclarationNode extends StatementNodeBase {
  statementType: StatementNodeType.classDeclaration;

  name: string;

  baseClasses: ExpressionNode[];
  decorators?: ExpressionNode[];
  body: StatementSequenceNode;
}
