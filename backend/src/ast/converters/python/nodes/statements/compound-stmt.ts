import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { PythonVisitorReturnValue } from "../../python-ast-visitor-return-value";
import { Compound_stmtContext } from "../../generated/PythonParser";

export const convertCompoundStmt = (
  visitor: IPythonAstVisitor,
  ctx: Compound_stmtContext,
): PythonVisitorReturnValue =>
  visitor.getStatements([
    ctx.function_def() ??
      ctx.if_stmt() ??
      ctx.class_def() ??
      ctx.with_stmt() ??
      ctx.for_stmt() ??
      ctx.try_stmt() ??
      ctx.while_stmt() ??
      ctx.match_stmt(),
  ]);
