import {
  ExpressionNodeType,
  OperatorNode,
} from "src/ast/types/general-ast/ast-nodes/expression-node";
import { AstNodeType } from "src/ast/types/general-ast";
import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { PythonVisitorReturnValue } from "../../python-ast-visitor-return-value";
import { Sequence_patternContext } from "../../generated/PythonParser";
import { sequencePatternOperator } from "../../operators";

export const convertSequencePattern = (
  visitor: IPythonAstVisitor,
  ctx: Sequence_patternContext,
): PythonVisitorReturnValue => {
  const sequenceExpressionCtx = ctx.LSQB()
    ? ctx.maybe_sequence_pattern()
    : ctx.open_sequence_pattern();

  const sequenceExpression = sequenceExpressionCtx
    ? visitor.getExpression(sequenceExpressionCtx)
    : null;

  if (sequenceExpression) {
    return sequenceExpression;
  }

  return {
    node: {
      nodeType: AstNodeType.expression,
      expressionType: ExpressionNodeType.operator,
      operator: sequencePatternOperator,
      operands: [],
    } satisfies OperatorNode,
    functionDeclarations: [],
  };
};
