import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import {
  ParametersContext,
  Slash_no_defaultContext,
  Slash_with_defaultContext,
  Star_etcContext,
} from "../../generated/PythonParser";
import { convertStarEtc } from "./star-etc";
import { Parameter } from "./param";
import { convertParamWithDefault } from "./param-with-default";
import { convertSlashNoDefault } from "./slash-no-default";
import { convertParamNoDefault } from "./param-no-default";
import { convertSlashWithDefault } from "./slash-with-default";

export const convertParameters = (
  visitor: IPythonAstVisitor,
  ctx: ParametersContext,
): Parameter[] => {
  const parameterWithDefault = ctx
    .param_with_default_list()
    .map((p) => convertParamWithDefault(visitor, p));

  const starEtc = ctx.star_etc() as Star_etcContext | undefined;
  let starEtcParameters: Parameter[] = [];
  if (starEtc) {
    starEtcParameters = convertStarEtc(visitor, starEtc);
  }

  const slashNoDefault = ctx.slash_no_default() as
    | Slash_no_defaultContext
    | undefined;

  if (slashNoDefault) {
    const slashNoDefaultParameters = convertSlashNoDefault(
      visitor,
      slashNoDefault,
    );

    const parametersNoDefault = ctx
      .param_no_default_list()
      .map((p) => convertParamNoDefault(visitor, p));

    return [
      ...slashNoDefaultParameters,
      ...parametersNoDefault,
      ...parameterWithDefault,
      ...starEtcParameters,
    ];
  }

  const slashWithDefault = ctx.slash_with_default() as
    | Slash_with_defaultContext
    | undefined;

  if (slashWithDefault) {
    const slashWithDefaultParameters = convertSlashWithDefault(
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
    .param_no_default_list()
    .map((p) => convertParamNoDefault(visitor, p));

  return [...parameterNoDefault, ...parameterWithDefault, ...starEtcParameters];
};
