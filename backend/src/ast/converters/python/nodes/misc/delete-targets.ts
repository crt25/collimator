import { ExpressionSequenceNode } from "src/ast/types/general-ast/ast-nodes/expression-node/expression-sequence-node";
import { AstNodeType } from "src/ast/types/general-ast";
import { ExpressionNodeType } from "src/ast/types/general-ast/ast-nodes/expression-node";
import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { PythonVisitorReturnValue } from "../../python-ast-visitor-return-value";
import { Del_targetsContext } from "../../generated/PythonParser";

export const convertDeleteTargets = (
  visitor: IPythonAstVisitor,
  ctx: Del_targetsContext,
): PythonVisitorReturnValue => {
  const expressions = visitor.getExpressions(ctx.del_target_list());

  return {
    node: {
      nodeType: AstNodeType.expression,
      expressionType: ExpressionNodeType.sequence,
      expressions: expressions.nodes,
    } satisfies ExpressionSequenceNode,
    functionDeclarations: expressions.functionDeclarations,
  };
};
