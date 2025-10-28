import { AstNodeType } from "src/ast/types/general-ast";
import {
  ExpressionNodeType,
  OperatorNode,
} from "src/ast/types/general-ast/ast-nodes/expression-node";
import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import {
  Kwarg_or_double_starredContext,
  NameContext,
} from "../../generated/PythonParser";
import { doubleStarKwArgsOperator } from "../../operators";
import { PythonFunctionArgument } from "./args";

export const convertKwargOrDoubleStarred = (
  visitor: IPythonAstVisitor,
  ctx: Kwarg_or_double_starredContext,
): PythonFunctionArgument => {
  const name = ctx.name() as NameContext | undefined;
  const expression = visitor.getExpression(ctx.expression());

  if (name) {
    return {
      name: name.getText(),
      expression: expression.node,
    };
  }

  return {
    name: null,
    expression: {
      nodeType: AstNodeType.expression,
      expressionType: ExpressionNodeType.operator,
      operator: doubleStarKwArgsOperator,
      operands: [expression.node],
    } satisfies OperatorNode,
  };
};
