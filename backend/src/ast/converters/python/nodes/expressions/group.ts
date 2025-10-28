import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { PythonVisitorReturnValue } from "../../python-ast-visitor-return-value";
import { GroupContext } from "../../generated/PythonParser";

export const convertGroup = (
  visitor: IPythonAstVisitor,
  ctx: GroupContext,
): PythonVisitorReturnValue =>
  visitor.getExpression(ctx.yield_expr() ?? ctx.named_expression());
