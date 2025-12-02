import { AstNodeType } from "src/ast/types/general-ast";
import {
  ExpressionNodeType,
  OperatorNode,
} from "src/ast/types/general-ast/ast-nodes/expression-node";
import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { PythonVisitorReturnValue } from "../../python-ast-visitor-return-value";
import { KvpairContext } from "../../generated/PythonParser";
import { createKeyValuePairOperator } from "../../operators";

export const convertKvpair = (
  visitor: IPythonAstVisitor,
  ctx: KvpairContext,
): PythonVisitorReturnValue => {
  const expressions = visitor.getExpressions(ctx.expression_list());

  return {
    node: {
      nodeType: AstNodeType.expression,
      expressionType: ExpressionNodeType.operator,
      operator: createKeyValuePairOperator,
      operands: expressions.nodes,
    } satisfies OperatorNode,
    functionDeclarations: expressions.functionDeclarations,
  };
};
