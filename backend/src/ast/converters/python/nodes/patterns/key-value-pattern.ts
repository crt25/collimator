import { AstNodeType } from "src/ast/types/general-ast";
import {
  ExpressionNodeType,
  LiteralNode,
  OperatorNode,
} from "src/ast/types/general-ast/ast-nodes/expression-node";
import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { PythonVisitorReturnValue } from "../../python-ast-visitor-return-value";
import { Key_value_patternContext } from "../../generated/PythonParser";

export const convertKeyValuePattern = (
  visitor: IPythonAstVisitor,
  ctx: Key_value_patternContext,
): PythonVisitorReturnValue => {
  const key = ctx.attr()
    ? {
        node: {
          nodeType: AstNodeType.expression,
          expressionType: ExpressionNodeType.literal,
          type: "key-pattern",
          value: ctx.attr().getText(),
        } satisfies LiteralNode,
        functionDeclarations: [],
      }
    : visitor.getExpression(ctx.literal_expr());

  const value = visitor.getExpression(ctx.pattern());

  return {
    node: {
      nodeType: AstNodeType.expression,
      expressionType: ExpressionNodeType.operator,
      operator: "key-value-pattern",
      operands: [key.node, value.node],
    } satisfies OperatorNode,
    functionDeclarations: [
      ...key.functionDeclarations,
      ...value.functionDeclarations,
    ],
  };
};
