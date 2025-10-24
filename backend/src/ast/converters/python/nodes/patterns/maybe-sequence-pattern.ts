import { AstNodeType } from "src/ast/types/general-ast";
import {
  ExpressionNodeType,
  OperatorNode,
} from "src/ast/types/general-ast/ast-nodes/expression-node";
import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { PythonVisitorReturnValue } from "../../python-ast-visitor-return-value";
import { Maybe_sequence_patternContext } from "../../generated/PythonParser";
import { sequencePatternOperator } from "../../operators";

export const convertMaybeSequencePattern = (
  visitor: IPythonAstVisitor,
  ctx: Maybe_sequence_patternContext,
): PythonVisitorReturnValue => {
  const expressions = visitor.getExpressions(ctx.maybe_star_pattern_list());

  if (expressions.nodes.length === 1) {
    return {
      node: expressions.nodes[0],
      functionDeclarations: expressions.functionDeclarations,
    };
  }

  return {
    node: {
      nodeType: AstNodeType.expression,
      expressionType: ExpressionNodeType.operator,
      operator: sequencePatternOperator,
      operands: expressions.nodes,
    } satisfies OperatorNode,
    functionDeclarations: expressions.functionDeclarations,
  };
};
