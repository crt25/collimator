import { StatementNodeBase } from "./statement-node-base";
import { StatementNodeType } from "./statement-node-type";
import { StatementNode } from ".";

/**
 * An AST node representing a code block consistinc of a sequence of statements.
 */
export interface StatementSequenceNode extends StatementNodeBase {
  statementType: StatementNodeType.sequence;

  statements: StatementNode[];
}
