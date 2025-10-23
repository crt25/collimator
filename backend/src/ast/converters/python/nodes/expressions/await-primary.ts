import { AstNodeType } from "src/ast/types/general-ast";
import {
  ExpressionNodeType,
  OperatorNode,
} from "src/ast/types/general-ast/ast-nodes/expression-node";
import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { PythonVisitorReturnValue } from "../../python-ast-visitor-return-value";
import { Await_primaryContext } from "../../generated/PythonParser";
import { awaitOperator } from "../../operators";

export const convertAwaitPrimary = (
  visitor: IPythonAstVisitor,
  ctx: Await_primaryContext,
): PythonVisitorReturnValue => {
  const primary = visitor.getExpression(ctx.primary());

  if (ctx.AWAIT()) {
    return {
      node: {
        nodeType: AstNodeType.expression,
        expressionType: ExpressionNodeType.operator,
        operator: awaitOperator,
        operands: [primary.node],
      } satisfies OperatorNode,
      functionDeclarations: primary.functionDeclarations,
    };
  }

  return primary;
};
