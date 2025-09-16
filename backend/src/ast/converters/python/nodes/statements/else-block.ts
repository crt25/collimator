import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { PythonVisitorReturnValue } from "../../python-ast-visitor-return-value";
import { Else_blockContext } from "../../generated/PythonParser";

export const convertElseBlock = (
  visitor: IPythonAstVisitor,
  ctx: Else_blockContext,
): PythonVisitorReturnValue => visitor.getStatementSequence([ctx.block()]);
