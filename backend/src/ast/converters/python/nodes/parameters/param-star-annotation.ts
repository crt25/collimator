import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import {
  Param_star_annotationContext,
  Star_annotationContext,
} from "../../generated/PythonParser";
import { Parameter } from "./param";

export const convertParamStarAnnotation = (
  visitor: IPythonAstVisitor,
  ctx: Param_star_annotationContext,
): Parameter => {
  const name = ctx.name().getText();
  const annotation = ctx.star_annotation() as
    | Star_annotationContext
    | undefined;

  if (annotation) {
    const typeAnnotation = visitor.getExpression(annotation);
    return {
      name,
      typeAnnotation: typeAnnotation.node,
      modifier: null,
      defaultValue: null,
    };
  }

  return {
    name,
    typeAnnotation: null,
    modifier: null,
    defaultValue: null,
  };
};
