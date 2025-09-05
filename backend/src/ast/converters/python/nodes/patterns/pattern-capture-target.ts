import {
  ExpressionNodeType,
  VariableNode,
} from "src/ast/types/general-ast/ast-nodes/expression-node";
import { AstNodeType } from "src/ast/types/general-ast";
import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { PythonVisitorReturnValue } from "../../python-ast-visitor-return-value";
import { Pattern_capture_targetContext } from "../../generated/PythonParser";

export const convertPatternCaptureTarget = (
  _visitor: IPythonAstVisitor,
  ctx: Pattern_capture_targetContext,
): PythonVisitorReturnValue => ({
  node: {
    nodeType: AstNodeType.expression,
    expressionType: ExpressionNodeType.variable,
    name: ctx.name_except_underscore().getText(),
  } satisfies VariableNode,
  functionDeclarations: [],
});
