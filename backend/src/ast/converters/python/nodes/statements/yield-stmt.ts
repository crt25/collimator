import { AstNodeType } from "src/ast/types/general-ast";
import { StatementNodeType } from "src/ast/types/general-ast/ast-nodes";
import { ExpressionAsStatementNode } from "src/ast/types/general-ast/ast-nodes/statement-node/expression-as-statement";
import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { PythonVisitorReturnValue } from "../../python-ast-visitor-return-value";
import { Yield_stmtContext } from "../../generated/PythonParser";

export const convertYieldStmt = (
  visitor: IPythonAstVisitor,
  ctx: Yield_stmtContext,
): PythonVisitorReturnValue => {
  const { node, functionDeclarations } = visitor.getExpression(
    ctx.yield_expr(),
  );

  return {
    node: {
      nodeType: AstNodeType.statement,
      statementType: StatementNodeType.expressionAsStatement,
      expression: node,
    } satisfies ExpressionAsStatementNode,
    functionDeclarations,
  };
};
