import {
  ConditionNode,
  StatementNodeType,
} from "src/ast/types/general-ast/ast-nodes";
import { AstNodeType } from "src/ast/types/general-ast";
import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { PythonVisitorReturnValue } from "../../python-ast-visitor-return-value";
import { If_stmtContext } from "../../generated/PythonParser";

export const convertIfStmt = (
  visitor: IPythonAstVisitor,
  ctx: If_stmtContext,
): PythonVisitorReturnValue => {
  const condition = visitor.getExpression(ctx.named_expression());
  const whenTrue = visitor.getStatementSequence([ctx.block()]);

  const whenFalse = visitor.getStatementSequence([
    ctx.elif_stmt() ?? ctx.else_block(),
  ]);

  return {
    node: {
      nodeType: AstNodeType.statement,
      statementType: StatementNodeType.condition,
      condition: condition.node,
      whenTrue: whenTrue.node,
      whenFalse: whenFalse.node,
    } satisfies ConditionNode,
    functionDeclarations: [
      ...condition.functionDeclarations,
      ...whenTrue.functionDeclarations,
      ...whenFalse.functionDeclarations,
    ],
  };
};
