import { AstNodeType } from "src/ast/types/general-ast";
import {
  ExpressionNode,
  ExpressionNodeType,
  OperatorNode,
} from "src/ast/types/general-ast/ast-nodes/expression-node";
import { FunctionDeclarationNode } from "src/ast/types/general-ast/ast-nodes";
import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { PythonVisitorReturnValue } from "../../python-ast-visitor-return-value";
import { SliceContext } from "../../generated/PythonParser";

export const convertSlice = (
  visitor: IPythonAstVisitor,
  ctx: SliceContext,
): PythonVisitorReturnValue => {
  const { nodes: expressions, functionDeclarations } = visitor.getExpressions(
    ctx.expression_list(),
  );

  if (expressions.length > 0) {
    let startExpression: ExpressionNode | null = null;
    let stopExpression: ExpressionNode | null = null;
    let stepExpression: ExpressionNode | null = null;

    const colonList = ctx.COLON_list();
    if (ctx.start.text === ":") {
      // we do not have a start expression
      stopExpression = expressions[0];
      stepExpression = expressions.length > 1 ? expressions[1] : null;
    } else if (colonList.length === 1) {
      // we do not have a step expression
      startExpression = expressions[0];
      stopExpression = expressions.length > 1 ? expressions[1] : null;
    } else if (colonList.length === 2 && expressions.length === 2) {
      // we have do not have a stop expression
      startExpression = expressions[0];
      stepExpression = expressions[1];
    } else if (colonList.length === 2 && expressions.length === 3) {
      // we have all three expressions
      startExpression = expressions[0];
      stopExpression = expressions[1];
      stepExpression = expressions[2];
    } else {
      throw new Error(
        `Unexpected slice format. Found ${colonList.length} colons, ${expressions.length} expressions and the '${ctx.start.text}' starting token.`,
      );
    }

    return createSliceExpression(
      startExpression,
      stopExpression,
      stepExpression,
      functionDeclarations,
    );
  }

  return visitor.visit(ctx.named_expression());
};

const createSliceExpression = (
  start: ExpressionNode | null,
  stop: ExpressionNode | null,
  step: ExpressionNode | null,
  functionDeclarations: FunctionDeclarationNode[],
): PythonVisitorReturnValue => {
  const operatorNameParts = ["create-slice"];
  const operands: ExpressionNode[] = [];

  if (start !== null) {
    operatorNameParts.push("start");
    operands.push(start);
  }

  if (stop !== null) {
    operatorNameParts.push("stop");
    operands.push(stop);
  }

  if (step !== null) {
    operatorNameParts.push("step");
    operands.push(step);
  }

  const operatorName = operatorNameParts.join("-");

  return {
    node: {
      nodeType: AstNodeType.expression,
      expressionType: ExpressionNodeType.operator,
      operator: operatorName,
      operands,
    } satisfies OperatorNode,
    functionDeclarations,
  };
};
