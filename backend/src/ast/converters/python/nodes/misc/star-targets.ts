import { AstNodeType } from "src/ast/types/general-ast";
import { ExpressionNodeType } from "src/ast/types/general-ast/ast-nodes/expression-node";
import { ExpressionSequenceNode } from "src/ast/types/general-ast/ast-nodes/expression-node/expression-sequence-node";
import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { PythonVisitorReturnValue } from "../../python-ast-visitor-return-value";
import { Star_targetsContext } from "../../generated/PythonParser";

export const convertStarTargets = (
  visitor: IPythonAstVisitor,
  ctx: Star_targetsContext,
): PythonVisitorReturnValue => {
  const { nodes: starTargets, functionDeclarations } = visitor.getExpressions(
    ctx.star_target_list(),
  );

  if (starTargets.length === 1) {
    return {
      node: starTargets[0],
      functionDeclarations,
    };
  }

  return {
    node: {
      nodeType: AstNodeType.expression,
      expressionType: ExpressionNodeType.sequence,
      expressions: starTargets,
    } satisfies ExpressionSequenceNode,
    functionDeclarations,
  };
};
