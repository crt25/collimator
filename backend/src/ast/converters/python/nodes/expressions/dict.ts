import {
  ExpressionNode,
  ExpressionNodeType,
  OperatorNode,
} from "src/ast/types/general-ast/ast-nodes/expression-node";
import { FunctionDeclarationNode } from "src/ast/types/general-ast/ast-nodes";
import { AstNodeType } from "src/ast/types/general-ast";
import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { PythonVisitorReturnValue } from "../../python-ast-visitor-return-value";
import {
  DictContext,
  Double_starred_kvpairsContext,
} from "../../generated/PythonParser";
import { createDictionaryOperator } from "../../operators";

export const convertDict = (
  visitor: IPythonAstVisitor,
  ctx: DictContext,
): PythonVisitorReturnValue => {
  const elements: ExpressionNode[] = [];
  const functionDeclarations: FunctionDeclarationNode[] = [];

  const keyPairs = ctx.double_starred_kvpairs() as
    | Double_starred_kvpairsContext
    | undefined;

  if (keyPairs) {
    const expressions = visitor.getExpression(keyPairs);

    elements.push(expressions.node);
    functionDeclarations.push(...expressions.functionDeclarations);
  }

  return {
    node: {
      nodeType: AstNodeType.expression,
      expressionType: ExpressionNodeType.operator,
      operator: createDictionaryOperator,
      operands: elements,
    } satisfies OperatorNode,
    functionDeclarations,
  };
};
