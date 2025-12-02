import { ExpressionNode } from "src/ast/types/general-ast/ast-nodes/expression-node";
import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import {
  Default_assignmentContext,
  Param_maybe_defaultContext,
} from "../../generated/PythonParser";
import { convertParam, Parameter } from "./param";

export const convertParamMaybeDefault = (
  visitor: IPythonAstVisitor,
  ctx: Param_maybe_defaultContext,
): Parameter => {
  const param = convertParam(visitor, ctx.param());

  let defaultValue: ExpressionNode | null = null;
  const defaultExpression = ctx.default_assignment() as
    | Default_assignmentContext
    | undefined;
  if (defaultExpression) {
    defaultValue = visitor.getExpression(ctx.default_assignment()).node;
  }

  return {
    ...param,
    defaultValue,
  };
};
