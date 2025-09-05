import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { KwdsContext } from "../../generated/PythonParser";
import { Parameter } from "./param";
import { convertParamNoDefault } from "./param-no-default";

export const convertKwds = (
  visitor: IPythonAstVisitor,
  ctx: KwdsContext,
): Parameter => {
  const param = convertParamNoDefault(visitor, ctx.param_no_default());

  return {
    name: param.name,
    typeAnnotation: param.typeAnnotation,
    modifier: "**",
    defaultValue: null,
  };
};
