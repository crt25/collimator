import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import {
  Lambda_parametersContext,
  Lambda_slash_no_defaultContext,
  Lambda_slash_with_defaultContext,
  Lambda_star_etcContext,
} from "../../generated/PythonParser";
import { Parameter } from "./param";
import { convertLambdaParamWithDefault } from "./lambda-param-with-default";
import { convertLambdaStarEtc } from "./lambda-star-etc";
import { convertLambdaSlashNoDefault } from "./lambda-slash-no-default";
import { convertLambdaParamNoDefault } from "./lambda-param-no-default";
import { convertLambdaSlashWithDefault } from "./lambda-slash-with-default";

export const convertLambdaParameters = (
  visitor: IPythonAstVisitor,
  ctx: Lambda_parametersContext,
): Parameter[] => {
  const parameterWithDefault = ctx
    .lambda_param_with_default_list()
    .map((p) => convertLambdaParamWithDefault(visitor, p));

  const starEtc = ctx.lambda_star_etc() as Lambda_star_etcContext | undefined;
  let starEtcParameters: Parameter[] = [];
  if (starEtc) {
    starEtcParameters = convertLambdaStarEtc(visitor, starEtc);
  }

  const slashNoDefault = ctx.lambda_slash_no_default() as
    | Lambda_slash_no_defaultContext
    | undefined;

  if (slashNoDefault) {
    const slashNoDefaultParameters = convertLambdaSlashNoDefault(
      visitor,
      slashNoDefault,
    );

    const parametersNoDefault = ctx
      .lambda_param_no_default_list()
      .map((p) => convertLambdaParamNoDefault(visitor, p));

    return [
      ...slashNoDefaultParameters,
      ...parametersNoDefault,
      ...parameterWithDefault,
      ...starEtcParameters,
    ];
  }

  const slashWithDefault = ctx.lambda_slash_with_default() as
    | Lambda_slash_with_defaultContext
    | undefined;

  if (slashWithDefault) {
    const slashWithDefaultParameters = convertLambdaSlashWithDefault(
      visitor,
      slashWithDefault,
    );

    return [
      ...slashWithDefaultParameters,
      ...parameterWithDefault,
      ...starEtcParameters,
    ];
  }

  const parameterNoDefault = ctx
    .lambda_param_no_default_list()
    .map((p) => convertLambdaParamNoDefault(visitor, p));

  return [...parameterNoDefault, ...parameterWithDefault, ...starEtcParameters];
};
