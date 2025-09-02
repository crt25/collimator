import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { PythonVisitorReturnValue } from "../../python-ast-visitor-return-value";
import {
  Bitwise_orContext,
  Star_expressionContext,
} from "../../generated/PythonParser";

export const convertStarExpression = (
  visitor: IPythonAstVisitor,
  ctx: Star_expressionContext,
): PythonVisitorReturnValue => {
  const bitwiseOr = ctx.bitwise_or() as Bitwise_orContext | undefined;

  if (bitwiseOr) {
    return visitor.visit(bitwiseOr);
  }

  return visitor.visit(ctx.expression());
};
