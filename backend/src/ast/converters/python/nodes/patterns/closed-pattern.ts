import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { PythonVisitorReturnValue } from "../../python-ast-visitor-return-value";
import { Closed_patternContext } from "../../generated/PythonParser";

export const convertClosedPattern = (
  visitor: IPythonAstVisitor,
  ctx: Closed_patternContext,
): PythonVisitorReturnValue =>
  visitor.getExpression(
    ctx.literal_pattern() ??
      ctx.capture_pattern() ??
      ctx.wildcard_pattern() ??
      ctx.value_pattern() ??
      ctx.group_pattern() ??
      ctx.sequence_pattern() ??
      ctx.mapping_pattern() ??
      ctx.class_pattern(),
  );
