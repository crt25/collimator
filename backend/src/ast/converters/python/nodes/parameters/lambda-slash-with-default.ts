import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { Lambda_slash_with_defaultContext } from "../../generated/PythonParser";
import { Parameter } from "./param";
import { convertLambdaParamNoDefault } from "./lambda-param-no-default";
import { convertLambdaParamWithDefault } from "./lambda-param-with-default";

export const convertLambdaSlashWithDefault = (
  visitor: IPythonAstVisitor,
  ctx: Lambda_slash_with_defaultContext,
): Parameter[] => [
  ...ctx
    .lambda_param_no_default_list()
    .map((param) => convertLambdaParamNoDefault(visitor, param))
    .map((p) => ({ ...p, defaultValue: null })),
  ...ctx
    .lambda_param_with_default_list()
    .map((param) => convertLambdaParamWithDefault(visitor, param)),
];
