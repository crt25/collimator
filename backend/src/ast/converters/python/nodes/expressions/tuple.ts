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
  Star_named_expressionContext,
  Star_named_expressionsContext,
  TupleContext,
} from "../../generated/PythonParser";

export const createTupleOperator = "create-tuple";

export const convertTuple = (
  visitor: IPythonAstVisitor,
  ctx: TupleContext,
): PythonVisitorReturnValue => {
  const exp = ctx.star_named_expression() as
    | Star_named_expressionContext
    | undefined;

  if (!exp) {
    return {
      node: {
        nodeType: AstNodeType.expression,
        expressionType: ExpressionNodeType.operator,
        operator: createTupleOperator,
        operands: [],
      } satisfies OperatorNode,
      functionDeclarations: [],
    };
  }

  const expression = visitor.getExpression(exp);

  const elements: ExpressionNode[] = [expression.node];
  const functionDeclarations: FunctionDeclarationNode[] =
    expression.functionDeclarations;

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
      operator: createTupleOperator,
      operands: elements,
    } satisfies OperatorNode,
    functionDeclarations,
  };
};
