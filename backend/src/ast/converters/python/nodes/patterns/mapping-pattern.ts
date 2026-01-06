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
  Double_star_patternContext,
  Items_patternContext,
  Mapping_patternContext,
} from "../../generated/PythonParser";
import { mappingPatternOperator } from "../../operators";

export const convertMappingPattern = (
  visitor: IPythonAstVisitor,
  ctx: Mapping_patternContext,
): PythonVisitorReturnValue => {
  const operands: ExpressionNode[] = [];
  const functionDeclarations: FunctionDeclarationNode[] = [];

  const itemsPatternContext = ctx.items_pattern() as
    | Items_patternContext
    | undefined;

  if (itemsPatternContext) {
    const itemsPattern = visitor.getExpression(itemsPatternContext);
    operands.push(itemsPattern.node);
    functionDeclarations.push(...itemsPattern.functionDeclarations);
  }

  const doubleStarPatternContext = ctx.double_star_pattern() as
    | Double_star_patternContext
    | undefined;

  if (doubleStarPatternContext) {
    const doubleStarPattern = visitor.getExpression(doubleStarPatternContext);
    operands.push(doubleStarPattern.node);
    functionDeclarations.push(...doubleStarPattern.functionDeclarations);
  }

  return {
    node: {
      nodeType: AstNodeType.expression,
      expressionType: ExpressionNodeType.operator,
      operator: mappingPatternOperator,
      operands,
    } satisfies OperatorNode,
    functionDeclarations,
  };
};
