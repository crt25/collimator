import { ExpressionSequenceNode } from "src/ast/types/general-ast/ast-nodes/expression-node/expression-sequence-node";
import { AstNodeType } from "src/ast/types/general-ast";
import { ExpressionNodeType } from "src/ast/types/general-ast/ast-nodes/expression-node";
import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { PythonVisitorReturnValue } from "../../python-ast-visitor-return-value";
import { Positional_patternsContext } from "../../generated/PythonParser";

export const convertPositionalPatterns = (
  visitor: IPythonAstVisitor,
  ctx: Positional_patternsContext,
): PythonVisitorReturnValue => {
  const expressions = visitor.getExpressions(ctx.pattern_list());

  return {
    node: {
      nodeType: AstNodeType.expression,
      expressionType: ExpressionNodeType.sequence,
      expressions: expressions.nodes,
    } satisfies ExpressionSequenceNode,
    functionDeclarations: expressions.functionDeclarations,
  };
};
