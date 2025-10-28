import { AstNodeType } from "src/ast/types/general-ast";
import {
  ExpressionNodeType,
  OperatorNode,
} from "src/ast/types/general-ast/ast-nodes/expression-node";
import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { PythonVisitorReturnValue } from "../../python-ast-visitor-return-value";
import { Or_patternContext } from "../../generated/PythonParser";
import { orPatternOperator } from "../../operators";

export const convertOrPattern = (
  visitor: IPythonAstVisitor,
  ctx: Or_patternContext,
): PythonVisitorReturnValue => {
  const patterns = visitor.getExpressions(ctx.closed_pattern_list());

  if (patterns.nodes.length === 1) {
    return {
      node: patterns.nodes[0],
      functionDeclarations: patterns.functionDeclarations,
    };
  }

  return {
    node: {
      nodeType: AstNodeType.expression,
      expressionType: ExpressionNodeType.operator,
      operator: orPatternOperator,
      operands: patterns.nodes,
    } satisfies OperatorNode,
    functionDeclarations: patterns.functionDeclarations,
  };
};
