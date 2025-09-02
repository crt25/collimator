import { AstNodeType } from "src/ast/types/general-ast";
import {
  ExpressionNodeType,
  OperatorNode,
} from "src/ast/types/general-ast/ast-nodes/expression-node";
import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { PythonVisitorReturnValue } from "../../python-ast-visitor-return-value";
import { InversionContext } from "../../generated/PythonParser";

export const convertInversion = (
  visitor: IPythonAstVisitor,
  ctx: InversionContext,
): PythonVisitorReturnValue => {
  const inversion = ctx.inversion() as InversionContext | undefined;
  if (inversion) {
    const arg = visitor.getExpression(inversion);

    return {
      node: {
        nodeType: AstNodeType.expression,
        expressionType: ExpressionNodeType.operator,
        operator: "not",
        operands: [arg.node],
      } satisfies OperatorNode,
      functionDeclarations: arg.functionDeclarations,
    };
  }

  return visitor.visit(ctx.comparison());
};
