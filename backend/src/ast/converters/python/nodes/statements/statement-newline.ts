import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { PythonVisitorReturnValue } from "../../python-ast-visitor-return-value";
import { Statement_newlineContext } from "../../generated/PythonParser";

export const convertStatementNewline = (
  visitor: IPythonAstVisitor,
  ctx: Statement_newlineContext,
): PythonVisitorReturnValue =>
  visitor.getStatements([ctx.compound_stmt() ?? ctx.simple_stmts()]);
