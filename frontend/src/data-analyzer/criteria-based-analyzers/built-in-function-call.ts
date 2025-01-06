import { GeneralAst } from "@ast/index";
import { StatementNodeType } from "@ast/ast-nodes";
import { ExpressionNodeType } from "@ast/ast-nodes/expression-node";
import {
  AstCriterionType,
  CriteriaBasedAnalyzerInput,
  CriteriaBasedAnalyzerOutput,
} from "../analyze-asts";
import { AstWalkSignal, walkAst } from "../ast-walk";

export const countBuiltInFunctionCalls = (
  ast: GeneralAst,
  input: Exclude<
    CriteriaBasedAnalyzerInput[AstCriterionType.builtInFunctionCall],
    undefined
  >,
): CriteriaBasedAnalyzerOutput[AstCriterionType.builtInFunctionCall] => {
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

  const builtInFunctionCallsByName = Object.fromEntries(
    Object.entries(callsByFunctionName).filter(
      ([functionName]) => !declaredFunctionNames.has(functionName),
    ),
  );

  const numberOfCalls =
    input.functionName === undefined
      ? Object.values(builtInFunctionCallsByName).reduce(
          (sum, calls) => sum + calls,
          0,
        )
      : (builtInFunctionCallsByName[input.functionName] ?? 0);

  return {
    callsByFunctionName: builtInFunctionCallsByName,
    numberOfCalls,
  };
};
