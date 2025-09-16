import {
  ExpressionNodeType,
  LiteralNode,
} from "src/ast/types/general-ast/ast-nodes/expression-node";
import { AstNodeType } from "src/ast/types/general-ast";
import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { PythonVisitorReturnValue } from "../../python-ast-visitor-return-value";
import { Real_numberContext } from "../../generated/PythonParser";

export const convertRealNumber = (
  _visitor: IPythonAstVisitor,
  ctx: Real_numberContext,
): PythonVisitorReturnValue => ({
  node: {
    nodeType: AstNodeType.expression,
    expressionType: ExpressionNodeType.literal,
    type: "number",
    value: ctx.NUMBER().getText(),
  } satisfies LiteralNode,
  functionDeclarations: [],
});
