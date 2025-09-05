import { ReturnNode } from "src/ast/types/general-ast/ast-nodes/statement-node/return-node";
import { AstNodeType } from "src/ast/types/general-ast";
import { StatementNodeType } from "src/ast/types/general-ast/ast-nodes";
import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { PythonVisitorReturnValue } from "../../python-ast-visitor-return-value";
import {
  Return_stmtContext,
  Star_expressionsContext,
} from "../../generated/PythonParser";

export const convertReturnStmt = (
  visitor: IPythonAstVisitor,
  ctx: Return_stmtContext,
): PythonVisitorReturnValue => {
  const starExpressions = ctx.star_expressions() as
    | Star_expressionsContext
    | undefined;

  if (starExpressions) {
    const { node, functionDeclarations } =
      visitor.getExpression(starExpressions);

    return {
      node: {
        nodeType: AstNodeType.statement,
        statementType: StatementNodeType.return,
        value: node,
      } satisfies ReturnNode,
      functionDeclarations,
    };
  }

  return {
    node: {
      nodeType: AstNodeType.statement,
      statementType: StatementNodeType.return,
      value: null,
    } satisfies ReturnNode,
    functionDeclarations: [],
  };
};
