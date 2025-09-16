import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { Lambda_paramsContext } from "../../generated/PythonParser";
import { convertLambdaParameters } from "./lambda-parameters";
import { Parameter } from "./param";

export const convertLambdaParams = (
  visitor: IPythonAstVisitor,
  ctx: Lambda_paramsContext,
): Parameter[] => convertLambdaParameters(visitor, ctx.lambda_parameters());
