import { AstNodeType } from "src/ast/types/general-ast";
import { ExpressionNodeType } from "src/ast/types/general-ast/ast-nodes/expression-node";
import { ExpressionSequenceNode } from "src/ast/types/general-ast/ast-nodes/expression-node/expression-sequence-node";
import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { PythonVisitorReturnValue } from "../../python-ast-visitor-return-value";
import { Double_starred_kvpairsContext } from "../../generated/PythonParser";

export const convertDoubleStarredKvpairs = (
  visitor: IPythonAstVisitor,
  ctx: Double_starred_kvpairsContext,
): PythonVisitorReturnValue => {
  const expressions = visitor.getExpressions(ctx.double_starred_kvpair_list());

  return {
    node: {
      nodeType: AstNodeType.expression,
      expressionType: ExpressionNodeType.sequence,
      expressions: expressions.nodes,
    } satisfies ExpressionSequenceNode,
    functionDeclarations: expressions.functionDeclarations,
  };
};
