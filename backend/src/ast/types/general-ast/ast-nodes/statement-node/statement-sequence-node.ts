import { StatementNode } from ".";
import { StatementNodeBase } from "./statement-node-base";
import { StatementNodeType } from "./statement-node-type";

/**
 * An AST node representing a code block consistinc of a sequence of statements.
 */
export interface StatementSequenceNode extends StatementNodeBase {
  codeType: StatementNodeType.sequence;

  statements: StatementNode[];
}
