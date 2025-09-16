import { AstNodeType } from "src/ast/types/general-ast";
import {
  ExpressionNodeType,
  LiteralNode,
} from "src/ast/types/general-ast/ast-nodes/expression-node";
import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { PythonVisitorReturnValue } from "../../python-ast-visitor-return-value";
import { Wildcard_patternContext } from "../../generated/PythonParser";

export const convertWildcardPattern = (
  _visitor: IPythonAstVisitor,
  _ctx: Wildcard_patternContext,
): PythonVisitorReturnValue => ({
  node: {
    nodeType: AstNodeType.expression,
    expressionType: ExpressionNodeType.literal,
    type: "wildcard",
    value: "",
  } satisfies LiteralNode,
  functionDeclarations: [],
});
