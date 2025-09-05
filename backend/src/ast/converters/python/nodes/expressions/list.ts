import { AstNodeType } from "src/ast/types/general-ast";
import {
  ExpressionNode,
  ExpressionNodeType,
  OperatorNode,
} from "src/ast/types/general-ast/ast-nodes/expression-node";
import { FunctionDeclarationNode } from "src/ast/types/general-ast/ast-nodes";
import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { PythonVisitorReturnValue } from "../../python-ast-visitor-return-value";
import {
  ListContext,
  Star_named_expressionsContext,
} from "../../generated/PythonParser";

export const createListOperator = "create-list";

export const convertList = (
  visitor: IPythonAstVisitor,
  ctx: ListContext,
): PythonVisitorReturnValue => {
  const elements: ExpressionNode[] = [];
  const functionDeclarations: FunctionDeclarationNode[] = [];

  const starNamedExpressions = ctx.star_named_expressions() as
    | Star_named_expressionsContext
    | undefined;

  if (starNamedExpressions) {
    const expressions = visitor.getExpression(starNamedExpressions);

    elements.push(expressions.node);
    functionDeclarations.push(...expressions.functionDeclarations);
  }

  return {
    node: {
      nodeType: AstNodeType.expression,
      expressionType: ExpressionNodeType.operator,
      operator: createListOperator,
      operands: elements,
    } satisfies OperatorNode,
    functionDeclarations,
  };
};
