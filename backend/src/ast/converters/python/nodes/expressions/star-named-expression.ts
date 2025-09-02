import {
  ExpressionNodeType,
  OperatorNode,
} from "src/ast/types/general-ast/ast-nodes/expression-node";
import { AstNodeType } from "src/ast/types/general-ast";
import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { PythonVisitorReturnValue } from "../../python-ast-visitor-return-value";
import { Star_named_expressionContext } from "../../generated/PythonParser";

export const convertStarNamedExpression = (
  visitor: IPythonAstVisitor,
  ctx: Star_named_expressionContext,
): PythonVisitorReturnValue => {
  if (ctx.STAR()) {
    const exp = visitor.getExpression(ctx.bitwise_or());

    return {
      node: {
        nodeType: AstNodeType.expression,
        expressionType: ExpressionNodeType.operator,
        operator: "*",
        operands: [exp.node],
      } satisfies OperatorNode,
      functionDeclarations: exp.functionDeclarations,
    };
  }

  return visitor.getExpression(ctx.named_expression());
};
