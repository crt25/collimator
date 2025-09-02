import { AstNodeType } from "src/ast/types/general-ast";
import {
  ExpressionNodeType,
  LiteralNode,
  OperatorNode,
} from "src/ast/types/general-ast/ast-nodes/expression-node";
import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { PythonVisitorReturnValue } from "../../python-ast-visitor-return-value";
import { Fstring_conversionContext } from "../../generated/PythonParser";

export const convertFstringConversion = (
  _visitor: IPythonAstVisitor,
  ctx: Fstring_conversionContext,
): PythonVisitorReturnValue => ({
  node: {
    nodeType: AstNodeType.expression,
    expressionType: ExpressionNodeType.operator,
    operator: "!",
    operands: [
      {
        nodeType: AstNodeType.expression,
        expressionType: ExpressionNodeType.literal,
        type: "string",
        value: ctx.name().getText(),
      } satisfies LiteralNode,
    ],
  } satisfies OperatorNode,
  functionDeclarations: [],
});
