import {
  ExpressionNodeType,
  OperatorNode,
} from "src/ast/types/general-ast/ast-nodes/expression-node";
import { AstNodeType } from "src/ast/types/general-ast";
import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { PythonVisitorReturnValue } from "../../python-ast-visitor-return-value";
import { Bitwise_orContext } from "../../generated/PythonParser";
import { bitwiseOrOperator } from "../../operators";

export const convertBitwiseOr = (
  visitor: IPythonAstVisitor,
  ctx: Bitwise_orContext,
): PythonVisitorReturnValue => {
  const bitwiseXor = visitor.getExpression(ctx.bitwise_xor());

  const bitwiseOr = ctx.bitwise_or() as Bitwise_orContext | undefined;
  if (!bitwiseOr) {
    return bitwiseXor;
  }

  const lhs = visitor.getExpression(bitwiseOr);

  return {
    node: {
      nodeType: AstNodeType.expression,
      expressionType: ExpressionNodeType.operator,
      operator: bitwiseOrOperator,
      operands: [lhs.node, bitwiseXor.node],
    } satisfies OperatorNode,
    functionDeclarations: [
      ...lhs.functionDeclarations,
      ...bitwiseXor.functionDeclarations,
    ],
  };
};
