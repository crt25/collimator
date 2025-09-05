import { AstNodeType } from "src/ast/types/general-ast";
import {
  ExpressionNodeType,
  LiteralNode,
  OperatorNode,
} from "src/ast/types/general-ast/ast-nodes/expression-node";
import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { PythonVisitorReturnValue } from "../../python-ast-visitor-return-value";
import { Keyword_patternContext } from "../../generated/PythonParser";

export const convertKeywordPattern = (
  visitor: IPythonAstVisitor,
  ctx: Keyword_patternContext,
): PythonVisitorReturnValue => {
  const pattern = visitor.getExpression(ctx.pattern());
  const name = ctx.name().getText();

  return {
    node: {
      nodeType: AstNodeType.expression,
      expressionType: ExpressionNodeType.operator,
      operator: "keyword-pattern",
      operands: [
        {
          nodeType: AstNodeType.expression,
          expressionType: ExpressionNodeType.literal,
          type: "string",
          value: name,
        } satisfies LiteralNode,
        pattern.node,
      ],
    } satisfies OperatorNode,
    functionDeclarations: pattern.functionDeclarations,
  };
};
