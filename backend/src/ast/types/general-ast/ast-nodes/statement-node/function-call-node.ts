import { ExpressionNode } from "../expression-node";
import { StatementNodeBase } from "./statement-node-base";
import { StatementNodeType } from "./statement-node-type";

/**
 * A node representing a function call.
 * Note that any system, library or environment call may be
 * represented by a function node with a special name.
 */
export interface FunctionCallNode extends StatementNodeBase {
  statementType: StatementNodeType.functionCall;

  name: string;
  arguments: ExpressionNode[];
}
