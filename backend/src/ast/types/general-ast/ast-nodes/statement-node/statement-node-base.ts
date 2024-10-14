import { AstNodeBase } from "../../ast-node-base";
import { AstNodeType } from "../../ast-node-type";
import { StatementNodeType } from "./statement-node-type";

/**
 * A node representing a statement.
 */
export interface StatementNodeBase extends AstNodeBase {
  nodeType: AstNodeType.statement;
  codeType: StatementNodeType;
}
