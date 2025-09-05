import {
  ExpressionNodeType,
  OperatorNode,
} from "src/ast/types/general-ast/ast-nodes/expression-node";
import { AstNodeType } from "src/ast/types/general-ast";
import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { PythonVisitorReturnValue } from "../../python-ast-visitor-return-value";
import { Type_param_starred_defaultContext } from "../../generated/PythonParser";

export const convertTypeParamStarredDefault = (
  visitor: IPythonAstVisitor,
  ctx: Type_param_starred_defaultContext,
): PythonVisitorReturnValue => {
  const expression = visitor.getExpression(ctx.star_expression());

  return {
    node: {
      nodeType: AstNodeType.expression,
      expressionType: ExpressionNodeType.operator,
      operator: "=",
      operands: [expression.node],
    } as OperatorNode,
    functionDeclarations: expression.functionDeclarations,
  };
};
