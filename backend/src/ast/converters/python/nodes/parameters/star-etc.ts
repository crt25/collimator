import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import {
  KwdsContext,
  Param_no_default_star_annotationContext,
  Param_no_defaultContext,
  Star_etcContext,
} from "../../generated/PythonParser";
import { convertParamNoDefault } from "./param-no-default";
import { convertParamMaybeDefault } from "./param-maybe-default";
import { convertKeywords } from "./keywords";
import { Parameter } from "./param";
import { convertParamNoDefaultStarAnnotation } from "./param-no-default-star-annotation";

export const convertStarEtc = (
  visitor: IPythonAstVisitor,
  ctx: Star_etcContext,
): Parameter[] => {
  const keywords = ctx.kwds() as KwdsContext | undefined;
  const keywordParameters = keywords
    ? convertKeywords(visitor, keywords)
    : null;

  const maybeDefaultParams = ctx
    .param_maybe_default_list()
    .map((p) => convertParamMaybeDefault(visitor, p));

  const paramNoDefault = ctx.param_no_default() as
    | Param_no_defaultContext
    | undefined;

  if (paramNoDefault) {
    const parameterNoDefault = convertParamNoDefault(visitor, paramNoDefault);

    if (!keywordParameters) {
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
      keywordParameters,
    ];
  }

  const paramNoDefaultStarAnnotation =
    ctx.param_no_default_star_annotation() as
      | Param_no_default_star_annotationContext
      | undefined;

  if (paramNoDefaultStarAnnotation) {
    const parameterNoDefaultStarAnnotation =
      convertParamNoDefaultStarAnnotation(
        visitor,
        paramNoDefaultStarAnnotation,
      );

    if (!keywordParameters) {
      return [
        {
          ...parameterNoDefaultStarAnnotation,
          modifier: "*",
        },
        ...maybeDefaultParams,
      ];
    }

    return [
      {
        ...parameterNoDefaultStarAnnotation,
        modifier: "*",
      },
      ...maybeDefaultParams,
      keywordParameters,
    ];
  }

  if (keywordParameters) {
    return [...maybeDefaultParams, keywordParameters];
  }

  return maybeDefaultParams;
};
