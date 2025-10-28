import { AstNodeType } from "src/ast/types/general-ast";
import {
  ExpressionNodeType,
  OperatorNode,
} from "src/ast/types/general-ast/ast-nodes/expression-node";
import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { PythonVisitorReturnValue } from "../../python-ast-visitor-return-value";
import { Double_star_patternContext } from "../../generated/PythonParser";
import { doubleStarPatternOperator } from "../../operators";

export const convertDoubleStarPattern = (
  visitor: IPythonAstVisitor,
  ctx: Double_star_patternContext,
): PythonVisitorReturnValue => {
  const pattern = visitor.getExpression(ctx.pattern_capture_target());

  return {
    node: {
      nodeType: AstNodeType.expression,
      expressionType: ExpressionNodeType.operator,
      operator: doubleStarPatternOperator,
      operands: [pattern.node],
    } satisfies OperatorNode,
    functionDeclarations: pattern.functionDeclarations,
  };
};
