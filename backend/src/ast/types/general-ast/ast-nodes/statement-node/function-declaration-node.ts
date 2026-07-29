import { ExpressionNode } from "../expression-node";
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
  decorators?: ExpressionNode[];
  // set (to true) only for declarations the language marks asynchronous,
  // e.g. python's `async def`
  isAsync?: boolean;
  body: StatementSequenceNode;
}
