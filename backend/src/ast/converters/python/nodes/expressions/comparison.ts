import {
  ExpressionNodeType,
  OperatorNode,
  ExpressionNode,
} from "src/ast/types/general-ast/ast-nodes/expression-node";
import { AstNodeType } from "src/ast/types/general-ast";
import { ParserRuleContext } from "antlr4";
import {
  Compare_op_bitwise_or_pairContext,
  ComparisonContext,
  Eq_bitwise_orContext,
  Gt_bitwise_orContext,
  Gte_bitwise_orContext,
  In_bitwise_orContext,
  Is_bitwise_orContext,
  Isnot_bitwise_orContext,
  Lt_bitwise_orContext,
  Lte_bitwise_orContext,
  Noteq_bitwise_orContext,
  Notin_bitwise_orContext,
} from "../../generated/PythonParser";
import { PythonVisitorReturnValue } from "../../python-ast-visitor-return-value";
import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import {
  equalityOperator,
  greaterThanOperator,
  greaterThanOrEqualOperator,
  inequalityOperator,
  inOperator,
  isNotOperator,
  isOperator,
  lessThanOperator,
  lessThanOrEqualOperator,
  notInOperator,
} from "../../operators";

export const convertComparison = (
  visitor: IPythonAstVisitor,
  ctx: ComparisonContext,
): PythonVisitorReturnValue => {
  const firstBitwiseOr = visitor.getExpression(ctx.bitwise_or());

  const list = ctx.compare_op_bitwise_or_pair_list();

  if (list.length === 0) {
    return firstBitwiseOr;
  }

  return list.reduce(
    (comparison, node) => {
      const { operator, value } = getOperatorAndNode(visitor, node);

      return {
        node: {
          nodeType: AstNodeType.expression,
          expressionType: ExpressionNodeType.operator,
          operator,
          operands: [comparison.node, value.node],
        } satisfies OperatorNode,
        functionDeclarations: [
          ...comparison.functionDeclarations,
          ...value.functionDeclarations,
        ],
      };
    },
    firstBitwiseOr as PythonVisitorReturnValue & {
      node: ExpressionNode;
    },
  );
};

const getOperatorAndNode = (
  visitor: IPythonAstVisitor,
  parentContext: Compare_op_bitwise_or_pairContext,
): {
  operator: string;
  value: PythonVisitorReturnValue & { node: ExpressionNode };
} => {
  if (parentContext.children?.length !== 1) {
    throw new Error(
      `Expected exactly 1 child in 'compare_op_bitwise_or_pair', got ${parentContext.children?.length}`,
    );
  }

  const ctx = parentContext.children[0] as ParserRuleContext;

  if (ctx instanceof Eq_bitwise_orContext) {
    return {
      operator: equalityOperator,
      value: visitor.getExpression(ctx.bitwise_or()),
    };
  } else if (ctx instanceof Noteq_bitwise_orContext) {
    return {
      operator: inequalityOperator,
      value: visitor.getExpression(ctx.bitwise_or()),
    };
  } else if (ctx instanceof Lte_bitwise_orContext) {
    return {
      operator: lessThanOrEqualOperator,
      value: visitor.getExpression(ctx.bitwise_or()),
    };
  } else if (ctx instanceof Lt_bitwise_orContext) {
    return {
      operator: lessThanOperator,
      value: visitor.getExpression(ctx.bitwise_or()),
    };
  } else if (ctx instanceof Gte_bitwise_orContext) {
    return {
      operator: greaterThanOrEqualOperator,
      value: visitor.getExpression(ctx.bitwise_or()),
    };
  } else if (ctx instanceof Gt_bitwise_orContext) {
    return {
      operator: greaterThanOperator,
      value: visitor.getExpression(ctx.bitwise_or()),
    };
  } else if (ctx instanceof Notin_bitwise_orContext) {
    return {
      operator: notInOperator,
      value: visitor.getExpression(ctx.bitwise_or()),
    };
  } else if (ctx instanceof In_bitwise_orContext) {
    return {
      operator: inOperator,
      value: visitor.getExpression(ctx.bitwise_or()),
    };
  } else if (ctx instanceof Isnot_bitwise_orContext) {
    return {
      operator: isNotOperator,
      value: visitor.getExpression(ctx.bitwise_or()),
    };
  } else if (ctx instanceof Is_bitwise_orContext) {
    return {
      operator: isOperator,
      value: visitor.getExpression(ctx.bitwise_or()),
    };
  }

  throw new Error(`Unexpected comparison context: ${ctx.constructor.name}`);
};
