import { AstWalkSignal, walkAst } from "../ast-walk";
import {
  AstCriterionType,
  CriteriaBasedAnalyzerInput,
  CriteriaBasedAnalyzerOutput,
} from "../analyze-asts";
import { GeneralAst } from "@ast/index";
import { StatementNodeType } from "@ast/ast-nodes";
import { ExpressionNodeType } from "@ast/ast-nodes/expression-node";

export const countCustomFunctionCalls = (
  ast: GeneralAst,
  _input: Exclude<
    CriteriaBasedAnalyzerInput[AstCriterionType.customFunctionCall],
    undefined
  >,
): CriteriaBasedAnalyzerOutput[AstCriterionType.customFunctionCall] => {
  const callsByFunctionName: Record<string, number> = {};
  const declaredFunctionNames = new Set<string>();

  const onFunctionCalled = (functionName: string): void => {
    if (functionName in callsByFunctionName) {
      callsByFunctionName[functionName]++;
    } else {
      callsByFunctionName[functionName] = 1;
    }
  };

  walkAst(ast, {
    statementCallback: (node) => {
      if (node.statementType == StatementNodeType.functionCall) {
        onFunctionCalled(node.name);
      }

      if (node.statementType === StatementNodeType.functionDeclaration) {
        declaredFunctionNames.add(node.name);
      }

      return AstWalkSignal.continueWalking;
    },

    expressionCallback: (node) => {
      if (node.expressionType == ExpressionNodeType.functionCall) {
        onFunctionCalled(node.name);
      }

      return AstWalkSignal.continueWalking;
    },
  });

  return Object.entries(callsByFunctionName)
    .filter(([functionName]) => declaredFunctionNames.has(functionName))
    .reduce((sum, [_, calls]) => sum + calls, 0);
};
