import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { Lambda_param_with_defaultContext } from "../../generated/PythonParser";
import { Parameter } from "./param";
import { convertLambdaParam } from "./lambda-param";

export const convertLambdaParamWithDefault = (
  visitor: IPythonAstVisitor,
  ctx: Lambda_param_with_defaultContext,
): Parameter => {
  const param = convertLambdaParam(visitor, ctx.lambda_param());
  const { node: defaultValue } = visitor.getExpression(
    ctx.default_assignment(),
  );

  return {
    ...param,
    defaultValue,
  };
};
