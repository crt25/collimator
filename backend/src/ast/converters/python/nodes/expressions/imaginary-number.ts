import { AstNodeType } from "src/ast/types/general-ast";
import {
  ExpressionNodeType,
  LiteralNode,
} from "src/ast/types/general-ast/ast-nodes/expression-node";
import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { PythonVisitorReturnValue } from "../../python-ast-visitor-return-value";
import { Imaginary_numberContext } from "../../generated/PythonParser";

export const convertImaginaryNumber = (
  _visitor: IPythonAstVisitor,
  ctx: Imaginary_numberContext,
): PythonVisitorReturnValue => ({
  node: {
    nodeType: AstNodeType.expression,
    expressionType: ExpressionNodeType.literal,
    type: "number",
    value: ctx.NUMBER().getText(),
  } satisfies LiteralNode,
  functionDeclarations: [],
});
