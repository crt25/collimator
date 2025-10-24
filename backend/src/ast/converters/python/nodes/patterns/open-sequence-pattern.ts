import {
  ExpressionNodeType,
  OperatorNode,
} from "src/ast/types/general-ast/ast-nodes/expression-node";
import { AstNodeType } from "src/ast/types/general-ast";
import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { PythonVisitorReturnValue } from "../../python-ast-visitor-return-value";
import { Open_sequence_patternContext } from "../../generated/PythonParser";
import { sequencePatternOperator } from "../../operators";

export const convertOpenSequencePattern = (
  visitor: IPythonAstVisitor,
  ctx: Open_sequence_patternContext,
): PythonVisitorReturnValue => {
  const expression = visitor.getExpression(ctx.maybe_star_pattern());
  if (!ctx.maybe_sequence_pattern()) {
    return {
      node: {
        nodeType: AstNodeType.expression,
        expressionType: ExpressionNodeType.operator,
        operator: sequencePatternOperator,
        operands: [expression.node],
      } satisfies OperatorNode,
      functionDeclarations: expression.functionDeclarations,
    };
  }

  const maybeSequenceExpression = visitor.getExpression(
    ctx.maybe_sequence_pattern(),
  );

  const nodes =
    maybeSequenceExpression.node.expressionType === ExpressionNodeType.sequence
      ? maybeSequenceExpression.node.expressions
      : [maybeSequenceExpression.node];

  return {
    node: {
      nodeType: AstNodeType.expression,
      expressionType: ExpressionNodeType.operator,
      operator: sequencePatternOperator,
      operands: [expression.node, ...nodes],
    } satisfies OperatorNode,
    functionDeclarations: [
      ...expression.functionDeclarations,
      ...maybeSequenceExpression.functionDeclarations,
    ],
  };
};
