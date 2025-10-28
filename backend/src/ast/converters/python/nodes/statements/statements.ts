import { StatementsContext } from "../../generated/PythonParser";
import { PythonVisitorReturnValue } from "../../python-ast-visitor-return-value";
import { IPythonAstVisitor } from "../../python-ast-visitor-interface";

export const convertStatements = (
  visitor: IPythonAstVisitor,
  ctx: StatementsContext,
): PythonVisitorReturnValue => visitor.getStatements(ctx.statement_list());
