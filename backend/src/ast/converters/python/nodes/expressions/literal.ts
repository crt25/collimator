import {
  ExpressionNodeType,
  LiteralNode,
} from "src/ast/types/general-ast/ast-nodes/expression-node";
import { AstNodeType } from "src/ast/types/general-ast";
import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { PythonVisitorReturnValue } from "../../python-ast-visitor-return-value";
import { Literal_exprContext } from "../../generated/PythonParser";

export const convertLiteralExpression = (
  visitor: IPythonAstVisitor,
  ctx: Literal_exprContext,
): PythonVisitorReturnValue => {
  if (ctx.NONE()) {
    return {
      node: {
        nodeType: AstNodeType.expression,
        expressionType: ExpressionNodeType.literal,
        type: "none",
        value: "",
      } satisfies LiteralNode,
      functionDeclarations: [],
    };
  }

  if (ctx.TRUE()) {
    return {
      node: {
        nodeType: AstNodeType.expression,
        expressionType: ExpressionNodeType.literal,
        type: "boolean",
        value: "true",
      } satisfies LiteralNode,
      functionDeclarations: [],
    };
  }

  if (ctx.FALSE()) {
    return {
      node: {
        nodeType: AstNodeType.expression,
        expressionType: ExpressionNodeType.literal,
        type: "boolean",
        value: "false",
      } satisfies LiteralNode,
      functionDeclarations: [],
    };
  }

  return visitor.getExpression(
    ctx.signed_number() ?? ctx.complex_number() ?? ctx.strings(),
  );
};
