import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { Lambda_slash_no_defaultContext } from "../../generated/PythonParser";
import { Parameter } from "./param";
import { convertLambdaParamNoDefault } from "./lambda-param-no-default";

export const convertLambdaSlashNoDefault = (
  visitor: IPythonAstVisitor,
  ctx: Lambda_slash_no_defaultContext,
): Parameter[] =>
  ctx
    .lambda_param_no_default_list()
    .map((param) => convertLambdaParamNoDefault(visitor, param));
