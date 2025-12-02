import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { Param_with_defaultContext } from "../../generated/PythonParser";
import { convertParam, Parameter } from "./param";

export const convertParamWithDefault = (
  visitor: IPythonAstVisitor,
  ctx: Param_with_defaultContext,
): Parameter => {
  const param = convertParam(visitor, ctx.param());
  const { node: defaultValue } = visitor.getExpression(
    ctx.default_assignment(),
  );

  return {
    ...param,
    defaultValue,
  };
};
