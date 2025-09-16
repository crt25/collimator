import { AstNodeType } from "src/ast/types/general-ast";
import { ExpressionNodeType } from "src/ast/types/general-ast/ast-nodes/expression-node";
import { ExpressionSequenceNode } from "src/ast/types/general-ast/ast-nodes/expression-node/expression-sequence-node";
import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { PythonVisitorReturnValue } from "../../python-ast-visitor-return-value";
import { Keyword_patternsContext } from "../../generated/PythonParser";

export const convertKeywordPatterns = (
  visitor: IPythonAstVisitor,
  ctx: Keyword_patternsContext,
): PythonVisitorReturnValue => {
  const expressions = visitor.getExpressions(ctx.keyword_pattern_list());

  return {
    node: {
      nodeType: AstNodeType.expression,
      expressionType: ExpressionNodeType.sequence,
      expressions: expressions.nodes,
    } satisfies ExpressionSequenceNode,
    functionDeclarations: expressions.functionDeclarations,
  };
};
