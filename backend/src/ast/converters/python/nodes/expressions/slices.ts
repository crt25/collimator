import { ParserRuleContext } from "antlr4";
import { ExpressionSequenceNode } from "src/ast/types/general-ast/ast-nodes/expression-node/expression-sequence-node";
import { AstNodeType } from "src/ast/types/general-ast";
import { ExpressionNodeType } from "src/ast/types/general-ast/ast-nodes/expression-node";
import { SlicesContext } from "../../generated/PythonParser";
import { PythonVisitorReturnValue } from "../../python-ast-visitor-return-value";
import { IPythonAstVisitor } from "../../python-ast-visitor-interface";

export const convertSlices = (
  visitor: IPythonAstVisitor,
  ctx: SlicesContext,
): PythonVisitorReturnValue => {
  const { nodes, functionDeclarations } = visitor.getExpressions(
    ctx.children?.filter((c) => c instanceof ParserRuleContext) ?? [],
  );

  return {
    node: {
      nodeType: AstNodeType.expression,
      expressionType: ExpressionNodeType.sequence,
      expressions: nodes,
    } satisfies ExpressionSequenceNode,
    functionDeclarations,
  };
};
