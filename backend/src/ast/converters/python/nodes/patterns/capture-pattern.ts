import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { PythonVisitorReturnValue } from "../../python-ast-visitor-return-value";
import { Capture_patternContext } from "../../generated/PythonParser";

export const convertCapturePattern = (
  visitor: IPythonAstVisitor,
  ctx: Capture_patternContext,
): PythonVisitorReturnValue =>
  visitor.getExpression(ctx.pattern_capture_target());
