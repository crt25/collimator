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

  walkAst(ast, {
    statementCallback: (node) => {
      if (node.statementType == StatementNodeType.functionCall) {
        if (
          input.functionName === undefined ||
          node.name === input.functionName
        ) {
          numberOfCalls++;
        }

        if (node.name in callsByFunctionName) {
          callsByFunctionName[node.name]++;
        } else {
          callsByFunctionName[node.name] = 1;
        }
      }

      return AstWalkSignal.continueWalking;
    },

    expressionCallback: (node) => {
      if (node.expressionType == ExpressionNodeType.functionCall) {
        if (
          input.functionName === undefined ||
          node.name === input.functionName
        ) {
          numberOfCalls++;
        }
      }

      return AstWalkSignal.continueWalking;
    },
  });

  return {
    callsByFunctionName,
    numberOfCalls,
  };
};
