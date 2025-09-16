import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { PythonVisitorReturnValue } from "../../python-ast-visitor-return-value";
import { InteractiveContext } from "../../generated/PythonParser";

export const convertInteractive = (
  visitor: IPythonAstVisitor,
  ctx: InteractiveContext,
): PythonVisitorReturnValue => visitor.visit(ctx.statement_newline());
