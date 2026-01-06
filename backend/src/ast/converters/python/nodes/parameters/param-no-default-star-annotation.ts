import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { Param_no_default_star_annotationContext } from "../../generated/PythonParser";
import { convertParamStarAnnotation } from "./param-star-annotation";
import { Parameter } from "./param";

export const convertParamNoDefaultStarAnnotation = (
  visitor: IPythonAstVisitor,
  ctx: Param_no_default_star_annotationContext,
): Parameter =>
  convertParamStarAnnotation(visitor, ctx.param_star_annotation());
