import { AstNodeType } from "src/ast/types/general-ast";
import {
  ExpressionNodeType,
  LiteralNode,
} from "src/ast/types/general-ast/ast-nodes/expression-node";
import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { PythonVisitorReturnValue } from "../../python-ast-visitor-return-value";
import { Fstring_middleContext } from "../../generated/PythonParser";

export const convertFstringMiddle = (
  visitor: IPythonAstVisitor,
  ctx: Fstring_middleContext,
): PythonVisitorReturnValue => {
  if (ctx.FSTRING_MIDDLE()) {
    return {
      node: {
        nodeType: AstNodeType.expression,
        expressionType: ExpressionNodeType.literal,
        type: "string",
        value: ctx.FSTRING_MIDDLE().getText(),
      } satisfies LiteralNode,
      functionDeclarations: [],
    };
  }

  return visitor.visit(ctx.fstring_replacement_field());
};
