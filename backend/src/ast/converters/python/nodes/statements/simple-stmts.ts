import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { PythonVisitorReturnValue } from "../../python-ast-visitor-return-value";
import { Simple_stmtsContext } from "../../generated/PythonParser";

export const convertSimpleStmts = (
  visitor: IPythonAstVisitor,
  ctx: Simple_stmtsContext,
): PythonVisitorReturnValue => visitor.getStatements(ctx.simple_stmt_list());
