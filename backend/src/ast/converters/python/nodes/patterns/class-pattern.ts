import {
  ExpressionNodeType,
  LiteralNode,
  OperatorNode,
} from "src/ast/types/general-ast/ast-nodes/expression-node";
import { AstNodeType } from "src/ast/types/general-ast";
import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { PythonVisitorReturnValue } from "../../python-ast-visitor-return-value";
import { Class_patternContext } from "../../generated/PythonParser";
import { classPatternOperator } from "../../operators";

export const convertClassPattern = (
  visitor: IPythonAstVisitor,
  ctx: Class_patternContext,
): PythonVisitorReturnValue => {
  const name = ctx.name_or_attr().getText();

  const positionalPatterns = ctx.positional_patterns()
    ? visitor.getExpression(ctx.positional_patterns())
    : null;
  const keywordPatterns = ctx.keyword_patterns()
    ? visitor.getExpression(ctx.keyword_patterns())
    : null;

  const children = [positionalPatterns, keywordPatterns].filter(
    (c) => c !== null,
  );
  const operands = [
    {
      nodeType: AstNodeType.expression,
      expressionType: ExpressionNodeType.literal,
      type: "string",
      value: name,
    } satisfies LiteralNode,
    ...children.map((c) => c.node),
  ];
  const functionDeclarations = children.flatMap((c) => c.functionDeclarations);

  return {
    node: {
      nodeType: AstNodeType.expression,
      expressionType: ExpressionNodeType.operator,
      operator: classPatternOperator,
      operands,
    } satisfies OperatorNode,
    functionDeclarations,
  };
};
