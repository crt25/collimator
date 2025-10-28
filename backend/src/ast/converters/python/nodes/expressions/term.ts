import { AstNodeType } from "src/ast/types/general-ast";
import {
  ExpressionNodeType,
  OperatorNode,
} from "src/ast/types/general-ast/ast-nodes/expression-node";
import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { PythonVisitorReturnValue } from "../../python-ast-visitor-return-value";
import { TermContext } from "../../generated/PythonParser";

export const convertTerm = (
  visitor: IPythonAstVisitor,
  ctx: TermContext,
): PythonVisitorReturnValue => {
  const factor = visitor.getExpression(ctx.factor());

  const term = ctx.term() as TermContext | undefined;
  if (!term) {
    return factor;
  }

  const operator = (
    ctx.STAR() ??
    ctx.SLASH() ??
    ctx.DOUBLESLASH() ??
    ctx.PERCENT() ??
    ctx.AT()
  ).getText();

  const lhs = visitor.getExpression(term);

  return {
    node: {
      nodeType: AstNodeType.expression,
      expressionType: ExpressionNodeType.operator,
      operator,
      operands: [lhs.node, factor.node],
    } satisfies OperatorNode,
    functionDeclarations: [
      ...lhs.functionDeclarations,
      ...factor.functionDeclarations,
    ],
  };
};
