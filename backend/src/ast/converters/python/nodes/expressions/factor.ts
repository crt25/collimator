import { AstNodeType } from "src/ast/types/general-ast";
import {
  ExpressionNodeType,
  OperatorNode,
} from "src/ast/types/general-ast/ast-nodes/expression-node";
import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { PythonVisitorReturnValue } from "../../python-ast-visitor-return-value";
import { FactorContext } from "../../generated/PythonParser";

export const convertFactor = (
  visitor: IPythonAstVisitor,
  ctx: FactorContext,
): PythonVisitorReturnValue => {
  const factor = ctx.factor() as FactorContext | undefined;
  if (factor) {
    const { node, functionDeclarations } = visitor.getExpression(factor);
    const operator = (ctx.PLUS() ?? ctx.MINUS() ?? ctx.TILDE()).getText();

    return {
      node: {
        nodeType: AstNodeType.expression,
        expressionType: ExpressionNodeType.operator,
        operator,
        operands: [node],
      } satisfies OperatorNode,
      functionDeclarations,
    };
  }

  return visitor.visit(ctx.power());
};
