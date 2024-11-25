import { AstWalkSignal, walkAst } from "../ast-walk";
import {
  CriterionType,
  CriteriaBasedAnalyzerInput,
  CriteriaBasedAnalyzerOutput,
} from "../analyze-asts";
import { GeneralAst } from "@ast/index";
import { StatementNodeType } from "@ast/ast-nodes";
import { ExpressionNodeType } from "@ast/ast-nodes/expression-node";

export const countFunctionCalls = (
  ast: GeneralAst,
  input: Exclude<
    CriteriaBasedAnalyzerInput[CriterionType.functionCall],
    undefined
  >,
): CriteriaBasedAnalyzerOutput[CriterionType.functionCall] => {
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

  return numberOfCalls;
};
