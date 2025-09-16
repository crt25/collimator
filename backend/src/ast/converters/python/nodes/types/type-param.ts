import { ExpressionNode } from "src/ast/types/general-ast/ast-nodes/expression-node";
import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import {
  Type_param_boundContext,
  Type_param_defaultContext,
  Type_param_starred_defaultContext,
  Type_paramContext,
} from "../../generated/PythonParser";

export type GenericTypeParameter = {
  name: string;
  bounded: ExpressionNode | null;
  default: ExpressionNode | null;
};

export const convertTypeParam = (
  visitor: IPythonAstVisitor,
  ctx: Type_paramContext,
): GenericTypeParameter => {
  const name = ctx.name().getText();

  const typeParameterDefault = ctx.type_param_default() as
    | Type_param_defaultContext
    | undefined;

  const typeParameterBound = ctx.type_param_bound() as
    | Type_param_boundContext
    | undefined;

  if (typeParameterBound && typeParameterDefault) {
    const defaultType = visitor.getExpression(typeParameterDefault);
    const bound = visitor.getExpression(typeParameterBound);

    return {
      name,
      bounded: bound.node,
      default: defaultType.node,
    };
  }

  if (typeParameterDefault) {
    const defaultType = visitor.getExpression(typeParameterDefault);

    return {
      name,
      bounded: null,
      default: defaultType.node,
    };
  }

  const typeParamStarredDefault = ctx.type_param_starred_default() as
    | Type_param_starred_defaultContext
    | undefined;

  if (typeParamStarredDefault) {
    const typeParameterListDefault = visitor.getExpression(
      typeParamStarredDefault,
    );

    return {
      name,
      bounded: null,
      default: typeParameterListDefault.node,
    };
  }

  return {
    name,
    bounded: null,
    default: null,
  };
};
