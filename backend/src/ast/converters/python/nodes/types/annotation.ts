import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { PythonVisitorReturnValue } from "../../python-ast-visitor-return-value";
import { AnnotationContext } from "../../generated/PythonParser";

export const convertAnnotation = (
  visitor: IPythonAstVisitor,
  ctx: AnnotationContext,
): PythonVisitorReturnValue => visitor.getExpression(ctx.expression());
