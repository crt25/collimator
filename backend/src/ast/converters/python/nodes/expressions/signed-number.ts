import { AstNodeType } from "src/ast/types/general-ast";
import {
  ExpressionNodeType,
  LiteralNode,
} from "src/ast/types/general-ast/ast-nodes/expression-node";
import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { PythonVisitorReturnValue } from "../../python-ast-visitor-return-value";
import { Signed_numberContext } from "../../generated/PythonParser";

export const convertSignedNumber = (
  _visitor: IPythonAstVisitor,
  ctx: Signed_numberContext,
): PythonVisitorReturnValue => ({
  node: {
    nodeType: AstNodeType.expression,
    expressionType: ExpressionNodeType.literal,
    type: "number",
    value: (ctx.MINUS() ? "-" : "") + ctx.NUMBER().getText(),
  } satisfies LiteralNode,
  functionDeclarations: [],
});
