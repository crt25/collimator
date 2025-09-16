import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { PythonVisitorReturnValue } from "../../python-ast-visitor-return-value";
import { Named_expressionContext } from "../../generated/PythonParser";

export const convertNamedExpression = (
  visitor: IPythonAstVisitor,
  ctx: Named_expressionContext,
): PythonVisitorReturnValue =>
  visitor.getExpression(ctx.assignment_expression() ?? ctx.expression());
