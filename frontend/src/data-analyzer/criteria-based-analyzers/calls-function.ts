import { AstWalkSignal, walkAst } from "../ast-walk";
import {
  Criterion,
  CriteriaBasedAnalyzerInput,
  CriteriaBasedAnalyzerOutput,
} from "../analyze-asts";
import { GeneralAst } from "@ast/index";
import { StatementNodeType } from "@ast/ast-nodes";
import { ExpressionNodeType } from "@ast/ast-nodes/expression-node";

export const callsFunction = (
  ast: GeneralAst,
  input: Exclude<
    CriteriaBasedAnalyzerInput[Criterion.callsFunction],
    undefined
  >,
): CriteriaBasedAnalyzerOutput[Criterion.callsFunction] => {
  let callsFunction = false;

  walkAst(ast, {
    statementCallback: (node) => {
      if (node.statementType == StatementNodeType.functionCall) {
        if (node.name == input.functionName) {
          callsFunction = true;

          // Stop walking the AST
          return AstWalkSignal.stopWalking;
        }
      }

      return AstWalkSignal.continueWalking;
    },

    expressionCallback: (node) => {
      if (node.expressionType == ExpressionNodeType.functionCall) {
        if (node.name == input.functionName) {
          callsFunction = true;

          // Stop walking the AST
          return AstWalkSignal.stopWalking;
        }
      }

      return AstWalkSignal.continueWalking;
    },
  });

  return callsFunction;
};
