import {
  ExpressionNodeType,
  LiteralNode,
} from "src/ast/types/general-ast/ast-nodes/expression-node";
import { AstNodeType } from "src/ast/types/general-ast";
import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { PythonVisitorReturnValue } from "../../python-ast-visitor-return-value";
import { Value_patternContext } from "../../generated/PythonParser";

export const convertValuePattern = (
  _visitor: IPythonAstVisitor,
  ctx: Value_patternContext,
): PythonVisitorReturnValue => {
  const attr = ctx.attr().getText();

  return {
    node: {
      nodeType: AstNodeType.expression,
      expressionType: ExpressionNodeType.literal,
      type: "value-pattern",
      value: attr,
    } satisfies LiteralNode,
    functionDeclarations: [],
  };
};
