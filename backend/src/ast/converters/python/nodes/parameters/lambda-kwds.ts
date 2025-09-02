import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { Lambda_kwdsContext } from "../../generated/PythonParser";
import { Parameter } from "./param";
import { convertLambdaParamNoDefault } from "./lambda-param-no-default";

export const convertLambdaKwds = (
  visitor: IPythonAstVisitor,
  ctx: Lambda_kwdsContext,
): Parameter => {
  const param = convertLambdaParamNoDefault(
    visitor,
    ctx.lambda_param_no_default(),
  );

  return {
    name: param.name,
    typeAnnotation: param.typeAnnotation,
    modifier: "**",
    defaultValue: null,
  };
};
