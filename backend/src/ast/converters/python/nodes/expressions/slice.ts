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
  const colons = ctx.COLON_list();

  if (colons.length === 0) {
    // the grammar's named_expression alternative: a plain subscript like a[1]
    return visitor.visit(ctx.named_expression());
  }

  // The colon form: which of start/stop/step an expression is follows from
  // its position relative to the colons, not from how many expressions there
  // are (a[:2] is a stop, a[::2] is a step). A fully open slice like a[:] has
  // no expressions at all.
  let startExpression: ExpressionNode | null = null;
  let stopExpression: ExpressionNode | null = null;
  let stepExpression: ExpressionNode | null = null;
  const functionDeclarations: FunctionDeclarationNode[] = [];

  for (const expressionCtx of ctx.expression_list()) {
    const colonsBefore = colons.filter(
      (colon) => colon.symbol.tokenIndex < expressionCtx.start.tokenIndex,
    ).length;

    const expression = visitor.getExpression(expressionCtx);
    functionDeclarations.push(...expression.functionDeclarations);

    if (colonsBefore === 0) {
      startExpression = expression.node;
    } else if (colonsBefore === 1) {
      stopExpression = expression.node;
    } else if (colonsBefore === 2) {
      stepExpression = expression.node;
    } else {
      throw new Error(
        `Unexpected slice format: expression preceded by ${colonsBefore} colons`,
      );
    }
  }

  return createSliceExpression(
    startExpression,
    stopExpression,
    stepExpression,
    functionDeclarations,
  );
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
