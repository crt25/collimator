import { AstNodeType } from "src/ast/types/general-ast";
import {
  ExpressionNodeType,
  OperatorNode,
} from "src/ast/types/general-ast/ast-nodes/expression-node";
import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { PythonVisitorReturnValue } from "../../python-ast-visitor-return-value";
import { Shift_exprContext } from "../../generated/PythonParser";

export const convertShiftExpr = (
  visitor: IPythonAstVisitor,
  ctx: Shift_exprContext,
): PythonVisitorReturnValue => {
  const sum = visitor.getExpression(ctx.sum());

  const shiftExpression = ctx.shift_expr() as Shift_exprContext | undefined;
  if (!shiftExpression) {
    return sum;
  }

  const operator = (ctx.LEFTSHIFT() ?? ctx.RIGHTSHIFT()).getText();
  const lhs = visitor.getExpression(shiftExpression);

  return {
    node: {
      nodeType: AstNodeType.expression,
      expressionType: ExpressionNodeType.operator,
      operator,
      operands: [lhs.node, sum.node],
    } satisfies OperatorNode,
    functionDeclarations: [
      ...lhs.functionDeclarations,
      ...sum.functionDeclarations,
    ],
  };
};
