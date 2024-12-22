import { AstWalkSignal, walkAst } from "../ast-walk";
import {
  AstCriterionType,
  CriteriaBasedAnalyzerInput,
  CriteriaBasedAnalyzerOutput,
} from "../analyze-asts";
import { GeneralAst } from "@ast/index";
import { StatementNodeType } from "@ast/ast-nodes";
import { ExpressionNodeType } from "@ast/ast-nodes/expression-node";

export const countFunctionCalls = (
  ast: GeneralAst,
  input: Exclude<
    CriteriaBasedAnalyzerInput[AstCriterionType.functionCall],
    undefined
  >,
): CriteriaBasedAnalyzerOutput[AstCriterionType.functionCall] => {
  const callsByFunctionName: Record<string, number> = {};

  let numberOfCalls = 0;

  const onFunctionCalled = (functionName: string): void => {
    if (
      input.functionName === undefined ||
      functionName === input.functionName
    ) {
      numberOfCalls++;
    }

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

      return AstWalkSignal.continueWalking;
    },

    expressionCallback: (node) => {
      if (node.expressionType == ExpressionNodeType.functionCall) {
        onFunctionCalled(node.name);
      }

      return AstWalkSignal.continueWalking;
    },
  });

  return {
    callsByFunctionName,
    numberOfCalls,
  };
};
