import { ExpressionNode } from "src/ast/types/general-ast/ast-nodes/expression-node";
import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import {
  Default_assignmentContext,
  Lambda_param_maybe_defaultContext,
} from "../../generated/PythonParser";
import { Parameter } from "./param";
import { convertLambdaParam } from "./lambda-param";

export const convertLambdaParamMaybeDefault = (
  visitor: IPythonAstVisitor,
  ctx: Lambda_param_maybe_defaultContext,
): Parameter => {
  const param = convertLambdaParam(visitor, ctx.lambda_param());

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
