import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { PythonVisitorReturnValue } from "../../python-ast-visitor-return-value";
import {
  Annotated_rhsContext,
  Yield_exprContext,
} from "../../generated/PythonParser";

export const convertAnnotatedRhs = (
  visitor: IPythonAstVisitor,
  ctx: Annotated_rhsContext,
): PythonVisitorReturnValue => {
  const yieldExpression = ctx.yield_expr() as Yield_exprContext | undefined;

  if (yieldExpression) {
    return visitor.visit(yieldExpression);
  }

  return visitor.visit(ctx.star_expressions());
};
