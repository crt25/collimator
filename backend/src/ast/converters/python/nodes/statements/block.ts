import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { PythonVisitorReturnValue } from "../../python-ast-visitor-return-value";
import { BlockContext, StatementsContext } from "../../generated/PythonParser";

export const convertBlock = (
  visitor: IPythonAstVisitor,
  ctx: BlockContext,
): PythonVisitorReturnValue => {
  const statements = ctx.statements() as StatementsContext | undefined;

  if (statements) {
    return visitor.visit(statements);
  }

  return visitor.visit(ctx.simple_stmts());
};
