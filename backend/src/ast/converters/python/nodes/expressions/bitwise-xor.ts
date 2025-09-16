import { AstNodeType } from "src/ast/types/general-ast";
import {
  ExpressionNodeType,
  OperatorNode,
} from "src/ast/types/general-ast/ast-nodes/expression-node";
import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { PythonVisitorReturnValue } from "../../python-ast-visitor-return-value";
import { Bitwise_xorContext } from "../../generated/PythonParser";

export const convertBitwiseXor = (
  visitor: IPythonAstVisitor,
  ctx: Bitwise_xorContext,
): PythonVisitorReturnValue => {
  const bitwiseAnd = visitor.getExpression(ctx.bitwise_and());

  const bitwiseXor = ctx.bitwise_xor() as Bitwise_xorContext | undefined;
  if (!bitwiseXor) {
    return bitwiseAnd;
  }

  const lhs = visitor.getExpression(bitwiseXor);

  return {
    node: {
      nodeType: AstNodeType.expression,
      expressionType: ExpressionNodeType.operator,
      operator: "^",
      operands: [lhs.node, bitwiseAnd.node],
    } satisfies OperatorNode,
    functionDeclarations: [
      ...lhs.functionDeclarations,
      ...bitwiseAnd.functionDeclarations,
    ],
  };
};
