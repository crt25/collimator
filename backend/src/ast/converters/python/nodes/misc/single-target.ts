import {
  ExpressionNodeType,
  VariableNode,
} from "src/ast/types/general-ast/ast-nodes/expression-node";
import { AstNodeType } from "src/ast/types/general-ast";
import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { PythonVisitorReturnValue } from "../../python-ast-visitor-return-value";
import { Single_targetContext } from "../../generated/PythonParser";

export const convertSingleTarget = (
  visitor: IPythonAstVisitor,
  ctx: Single_targetContext,
): PythonVisitorReturnValue => {
  if (ctx.name()) {
    return {
      node: {
        nodeType: AstNodeType.expression,
        expressionType: ExpressionNodeType.variable,
        name: ctx.name().getText(),
      } satisfies VariableNode,
      functionDeclarations: [],
    };
  }

  if (ctx.LPAR() && ctx.RPAR()) {
    return visitor.visit(ctx.single_target());
  }

  return visitor.visit(ctx.single_subscript_attribute_target());
};
