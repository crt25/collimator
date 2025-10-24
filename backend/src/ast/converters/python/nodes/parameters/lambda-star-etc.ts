import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import {
  Lambda_kwdsContext,
  Lambda_param_no_defaultContext,
  Lambda_star_etcContext,
} from "../../generated/PythonParser";
import { Parameter } from "./param";
import { convertLambdaKeywords } from "./lambda-keywords";
import { convertLambdaParamNoDefault } from "./lambda-param-no-default";
import { convertLambdaParamMaybeDefault } from "./lambda-param-maybe-default";

export const convertLambdaStarEtc = (
  visitor: IPythonAstVisitor,
  ctx: Lambda_star_etcContext,
): Parameter[] => {
  const keywords = ctx.lambda_kwds() as Lambda_kwdsContext | undefined;
  const keywordParameter = keywords
    ? convertLambdaKeywords(visitor, keywords)
    : null;

  const maybeDefaultParams = ctx
    .lambda_param_maybe_default_list()
    .map((p) => convertLambdaParamMaybeDefault(visitor, p));

  const paramNoDefault = ctx.lambda_param_no_default() as
    | Lambda_param_no_defaultContext
    | undefined;

  if (paramNoDefault) {
    const parameterNoDefault = convertLambdaParamNoDefault(
      visitor,
      paramNoDefault,
    );

    if (!keywordParameter) {
      return [
        {
          ...parameterNoDefault,
          modifier: "*",
        },
        ...maybeDefaultParams,
      ];
    }

    return [
      {
        ...parameterNoDefault,
        modifier: "*",
      },
      ...maybeDefaultParams,
      keywordParameter,
    ];
  }

  if (keywordParameter) {
    return [...maybeDefaultParams, keywordParameter];
  }

  return maybeDefaultParams;
};
