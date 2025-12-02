import { ExpressionSequenceNode } from "src/ast/types/general-ast/ast-nodes/expression-node/expression-sequence-node";
import { ExpressionNodeType } from "src/ast/types/general-ast/ast-nodes/expression-node";
import { ParserRuleContext } from "antlr4";
import { AstNodeType } from "src/ast/types/general-ast";
import { Star_expressionsContext } from "../../generated/PythonParser";
import { PythonVisitorReturnValue } from "../../python-ast-visitor-return-value";
import { IPythonAstVisitor } from "../../python-ast-visitor-interface";

export const convertStarExpressions = (
  visitor: IPythonAstVisitor,
  ctx: Star_expressionsContext,
): PythonVisitorReturnValue => {
  const { nodes: children, functionDeclarations } = visitor.getExpressions(
    (ctx.children ?? []).filter((c) => c instanceof ParserRuleContext),
  );

  if (children.length === 1) {
    return {
      node: children[0],
      functionDeclarations,
    };
  }

  return {
    node: {
      nodeType: AstNodeType.expression,
      expressionType: ExpressionNodeType.sequence,
      expressions: children,
    } satisfies ExpressionSequenceNode,
    functionDeclarations,
  };
};
