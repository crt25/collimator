import {
  ExpressionNodeType,
  OperatorNode,
} from "src/ast/types/general-ast/ast-nodes/expression-node";
import { AstNodeType } from "src/ast/types/general-ast";
import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { PythonVisitorReturnValue } from "../../python-ast-visitor-return-value";
import { As_patternContext } from "../../generated/PythonParser";
import { asPatternOperator } from "../../operators";

export const convertAsPattern = (
  visitor: IPythonAstVisitor,
  ctx: As_patternContext,
): PythonVisitorReturnValue => {
  const pattern = visitor.getExpression(ctx.or_pattern());
  const target = visitor.getExpression(ctx.pattern_capture_target());

  return {
    node: {
      nodeType: AstNodeType.expression,
      expressionType: ExpressionNodeType.operator,
      operator: asPatternOperator,
      operands: [pattern.node, target.node],
    } satisfies OperatorNode,
    functionDeclarations: [
      ...pattern.functionDeclarations,
      ...target.functionDeclarations,
    ],
  };
};
