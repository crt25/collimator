import { AstNodeType } from "src/ast/types/general-ast";
import {
  ExpressionNodeType,
  OperatorNode,
} from "src/ast/types/general-ast/ast-nodes/expression-node";
import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { PythonVisitorReturnValue } from "../../python-ast-visitor-return-value";
import { Type_param_boundContext } from "../../generated/PythonParser";
import { typeParameterBoundOperator } from "../../operators";

export const convertTypeParamBound = (
  visitor: IPythonAstVisitor,
  ctx: Type_param_boundContext,
): PythonVisitorReturnValue => {
  const expression = visitor.getExpression(ctx.expression());

  return {
    node: {
      nodeType: AstNodeType.expression,
      expressionType: ExpressionNodeType.operator,
      operator: typeParameterBoundOperator,
      operands: [expression.node],
    } as OperatorNode,
    functionDeclarations: expression.functionDeclarations,
  };
};
