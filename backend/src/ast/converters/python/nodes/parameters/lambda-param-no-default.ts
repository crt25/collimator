import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { Lambda_param_no_defaultContext } from "../../generated/PythonParser";
import { Parameter } from "./param";
import { convertLambdaParam } from "./lambda-param";

export const convertLambdaParamNoDefault = (
  visitor: IPythonAstVisitor,
  ctx: Lambda_param_no_defaultContext,
): Parameter => convertLambdaParam(visitor, ctx.lambda_param());
