import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { PythonVisitorReturnValue } from "../../python-ast-visitor-return-value";
import { StatementContext } from "../../generated/PythonParser";

export const convertStatement = (
  visitor: IPythonAstVisitor,
  ctx: StatementContext,
): PythonVisitorReturnValue =>
  visitor.visit(ctx.compound_stmt() ?? ctx.simple_stmts());
