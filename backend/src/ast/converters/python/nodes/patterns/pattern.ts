import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { PythonVisitorReturnValue } from "../../python-ast-visitor-return-value";
import { PatternContext } from "../../generated/PythonParser";

export const convertPattern = (
  visitor: IPythonAstVisitor,
  ctx: PatternContext,
): PythonVisitorReturnValue =>
  visitor.getExpression(ctx.as_pattern() ?? ctx.or_pattern());
