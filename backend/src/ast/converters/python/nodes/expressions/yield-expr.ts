import { AstNodeType } from "src/ast/types/general-ast";
import {
  ExpressionNodeType,
  OperatorNode,
} from "src/ast/types/general-ast/ast-nodes/expression-node";
import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { PythonVisitorReturnValue } from "../../python-ast-visitor-return-value";
import { Yield_exprContext } from "../../generated/PythonParser";
import { yieldOperator } from "../../operators";

export const convertYieldExpr = (
  visitor: IPythonAstVisitor,
  ctx: Yield_exprContext,
): PythonVisitorReturnValue => {
  const expression = visitor.getExpression(
    ctx.expression() ?? ctx.star_expressions(),
  );

  return {
    node: {
      nodeType: AstNodeType.expression,
      expressionType: ExpressionNodeType.operator,
      operator: yieldOperator,
      operands: [expression.node],
    } satisfies OperatorNode,
    functionDeclarations: expression.functionDeclarations,
  };
};
