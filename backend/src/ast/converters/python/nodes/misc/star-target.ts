import { AstNodeType } from "src/ast/types/general-ast";
import {
  ExpressionNodeType,
  OperatorNode,
} from "src/ast/types/general-ast/ast-nodes/expression-node";
import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { PythonVisitorReturnValue } from "../../python-ast-visitor-return-value";
import { Star_targetContext } from "../../generated/PythonParser";

export const convertStarTarget = (
  visitor: IPythonAstVisitor,
  ctx: Star_targetContext,
): PythonVisitorReturnValue => {
  if (ctx.STAR()) {
    const starTarget = visitor.getExpression(ctx.star_target());

    return {
      node: {
        nodeType: AstNodeType.expression,
        expressionType: ExpressionNodeType.operator,
        operator: "*",
        operands: [starTarget.node],
      } satisfies OperatorNode,
      functionDeclarations: starTarget.functionDeclarations,
    };
  }

  return visitor.visit(ctx.target_with_star_atom());
};
