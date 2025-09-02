import { AstNodeType } from "src/ast/types/general-ast";
import {
  ExpressionNodeType,
  OperatorNode,
} from "src/ast/types/general-ast/ast-nodes/expression-node";
import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { PythonVisitorReturnValue } from "../../python-ast-visitor-return-value";
import { Signed_real_numberContext } from "../../generated/PythonParser";

export const convertSignedRealNumber = (
  visitor: IPythonAstVisitor,
  ctx: Signed_real_numberContext,
): PythonVisitorReturnValue => {
  const number = visitor.getExpression(ctx.real_number());

  if (!ctx.MINUS()) {
    return number;
  }

  return {
    node: {
      nodeType: AstNodeType.expression,
      expressionType: ExpressionNodeType.operator,
      operator: "-",
      operands: [number.node],
    } satisfies OperatorNode,
    functionDeclarations: number.functionDeclarations,
  };
};
