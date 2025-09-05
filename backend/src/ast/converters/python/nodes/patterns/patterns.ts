import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { PythonVisitorReturnValue } from "../../python-ast-visitor-return-value";
import { PatternsContext } from "../../generated/PythonParser";

export const convertPatterns = (
  visitor: IPythonAstVisitor,
  ctx: PatternsContext,
): PythonVisitorReturnValue =>
  visitor.getExpression(ctx.open_sequence_pattern() ?? ctx.pattern());
