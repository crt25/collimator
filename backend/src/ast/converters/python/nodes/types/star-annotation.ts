import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { PythonVisitorReturnValue } from "../../python-ast-visitor-return-value";
import { Star_annotationContext } from "../../generated/PythonParser";

export const convertStarAnnotation = (
  visitor: IPythonAstVisitor,
  ctx: Star_annotationContext,
): PythonVisitorReturnValue => visitor.getExpression(ctx.star_expression());
