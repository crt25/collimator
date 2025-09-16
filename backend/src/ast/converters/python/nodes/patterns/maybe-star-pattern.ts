import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { PythonVisitorReturnValue } from "../../python-ast-visitor-return-value";
import { Maybe_star_patternContext } from "../../generated/PythonParser";

export const convertMaybeStarPattern = (
  visitor: IPythonAstVisitor,
  ctx: Maybe_star_patternContext,
): PythonVisitorReturnValue =>
  visitor.getExpression(ctx.star_pattern() ?? ctx.pattern());
