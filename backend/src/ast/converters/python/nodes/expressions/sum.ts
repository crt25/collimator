import { AstNodeType } from "src/ast/types/general-ast";
import {
  ExpressionNodeType,
  OperatorNode,
} from "src/ast/types/general-ast/ast-nodes/expression-node";
import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { PythonVisitorReturnValue } from "../../python-ast-visitor-return-value";
import { SumContext } from "../../generated/PythonParser";

export const convertSum = (
  visitor: IPythonAstVisitor,
  ctx: SumContext,
): PythonVisitorReturnValue => {
  const term = visitor.getExpression(ctx.term());

  const sum = ctx.sum() as SumContext | undefined;
  if (!sum) {
    return term;
  }

  const operator = (ctx.PLUS() ?? ctx.MINUS()).getText();
  const lhs = visitor.getExpression(sum);

  return {
    node: {
      nodeType: AstNodeType.expression,
      expressionType: ExpressionNodeType.operator,
      operator,
      operands: [lhs.node, term.node],
    } satisfies OperatorNode,
    functionDeclarations: [
      ...lhs.functionDeclarations,
      ...term.functionDeclarations,
    ],
  };
};
