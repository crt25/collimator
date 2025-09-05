import { AstNodeType } from "src/ast/types/general-ast";
import {
  ExpressionNodeType,
  OperatorNode,
} from "src/ast/types/general-ast/ast-nodes/expression-node";
import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { PythonVisitorReturnValue } from "../../python-ast-visitor-return-value";
import { Items_patternContext } from "../../generated/PythonParser";

export const convertItemsPattern = (
  visitor: IPythonAstVisitor,
  ctx: Items_patternContext,
): PythonVisitorReturnValue => {
  const patterns = visitor.getExpressions(ctx.key_value_pattern_list());

  return {
    node: {
      nodeType: AstNodeType.expression,
      expressionType: ExpressionNodeType.operator,
      operator: "items-pattern",
      operands: patterns.nodes,
    } satisfies OperatorNode,
    functionDeclarations: patterns.functionDeclarations,
  };
};
