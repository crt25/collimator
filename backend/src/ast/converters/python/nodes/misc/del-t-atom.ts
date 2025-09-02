import {
  ExpressionNodeType,
  OperatorNode,
  VariableNode,
} from "src/ast/types/general-ast/ast-nodes/expression-node";
import { AstNodeType } from "src/ast/types/general-ast";
import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { PythonVisitorReturnValue } from "../../python-ast-visitor-return-value";
import {
  Del_t_atomContext,
  Del_targetContext,
  Del_targetsContext,
} from "../../generated/PythonParser";

export const convertDelTAtom = (
  visitor: IPythonAstVisitor,
  ctx: Del_t_atomContext,
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

  const delTarget = ctx.del_target() as Del_targetContext | undefined;
  if (delTarget) {
    const deleteTarget = visitor.getExpression(delTarget);

    return {
      node: {
        nodeType: AstNodeType.expression,
        expressionType: ExpressionNodeType.operator,
        operator: "()",
        operands: [deleteTarget.node],
      } satisfies OperatorNode,
      functionDeclarations: deleteTarget.functionDeclarations,
    };
  }

  const delTargets = ctx.del_targets() as Del_targetsContext | undefined;
  const deleteTargets = delTargets
    ? visitor.getExpression(ctx.del_targets())
    : null;

  return {
    node: {
      nodeType: AstNodeType.expression,
      expressionType: ExpressionNodeType.operator,
      operator: ctx.LPAR() ? "()" : "[]",
      operands: deleteTargets ? [deleteTargets.node] : [],
    } satisfies OperatorNode,
    functionDeclarations: deleteTargets?.functionDeclarations ?? [],
  };
};
