import { AstNodeType } from "src/ast/types/general-ast";
import {
  ExpressionNodeType,
  OperatorNode,
} from "src/ast/types/general-ast/ast-nodes/expression-node";
import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { PythonVisitorReturnValue } from "../../python-ast-visitor-return-value";
import { FactorContext, PowerContext } from "../../generated/PythonParser";
import { powerOperator } from "../../operators";

export const convertPower = (
  visitor: IPythonAstVisitor,
  ctx: PowerContext,
): PythonVisitorReturnValue => {
  const primary = visitor.getExpression(ctx.await_primary());
  const factor = ctx.factor() as FactorContext | undefined;

  if (!factor) {
    return primary;
  }

  const { node, functionDeclarations } = visitor.getExpression(factor);

  return {
    node: {
      nodeType: AstNodeType.expression,
      expressionType: ExpressionNodeType.operator,
      operator: powerOperator,
      operands: [primary.node, node],
    } satisfies OperatorNode,
    functionDeclarations: [
      ...primary.functionDeclarations,
      ...functionDeclarations,
    ],
  };
};
