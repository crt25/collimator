import {
  ExpressionNodeType,
  OperatorNode,
} from "src/ast/types/general-ast/ast-nodes/expression-node";
import { AstNodeType } from "src/ast/types/general-ast";
import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { PythonVisitorReturnValue } from "../../python-ast-visitor-return-value";
import { Bitwise_andContext } from "../../generated/PythonParser";

export const convertBitwiseAnd = (
  visitor: IPythonAstVisitor,
  ctx: Bitwise_andContext,
): PythonVisitorReturnValue => {
  const shiftExpression = visitor.getExpression(ctx.shift_expr());

  const bitwiseAnd = ctx.bitwise_and() as Bitwise_andContext | undefined;
  if (!bitwiseAnd) {
    return shiftExpression;
  }

  const lhs = visitor.getExpression(bitwiseAnd);

  return {
    node: {
      nodeType: AstNodeType.expression,
      expressionType: ExpressionNodeType.operator,
      operator: "&",
      operands: [lhs.node, shiftExpression.node],
    } satisfies OperatorNode,
    functionDeclarations: [
      ...lhs.functionDeclarations,
      ...shiftExpression.functionDeclarations,
    ],
  };
};
