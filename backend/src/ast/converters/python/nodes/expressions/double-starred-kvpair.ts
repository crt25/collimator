import { AstNodeType } from "src/ast/types/general-ast";
import {
  ExpressionNodeType,
  OperatorNode,
} from "src/ast/types/general-ast/ast-nodes/expression-node";
import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { PythonVisitorReturnValue } from "../../python-ast-visitor-return-value";
import {
  Bitwise_orContext,
  Double_starred_kvpairContext,
} from "../../generated/PythonParser";
import { doubleStarKvPairOperator } from "../../operators";

export const convertDoubleStarredKvpair = (
  visitor: IPythonAstVisitor,
  ctx: Double_starred_kvpairContext,
): PythonVisitorReturnValue => {
  const bitwiseOr = ctx.bitwise_or() as Bitwise_orContext | undefined;
  if (bitwiseOr) {
    const { node, functionDeclarations } = visitor.getExpression(bitwiseOr);

    return {
      node: {
        nodeType: AstNodeType.expression,
        expressionType: ExpressionNodeType.operator,
        operator: doubleStarKvPairOperator,
        operands: [node],
      } satisfies OperatorNode,
      functionDeclarations,
    };
  }

  return visitor.visit(ctx.kvpair());
};
