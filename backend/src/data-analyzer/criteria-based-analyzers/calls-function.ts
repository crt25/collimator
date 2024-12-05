import { GeneralAst } from "src/ast/types/general-ast";
import { AstWalkSignal, walkAst } from "../ast-walk";
import { StatementNodeType } from "src/ast/types/general-ast/ast-nodes";
import { ExpressionNodeType } from "src/ast/types/general-ast/ast-nodes/expression-node";
import {
  Criterion,
  CriteriaBasedAnalyzerInput,
  CriteriaBasedAnalyzerOutput,
} from "../criteria-based-analysis-worker.piscina";

export const callsFunction = (
  ast: GeneralAst,
  input: Exclude<CriteriaBasedAnalyzerInput[Criterion.callsFunction], undefined>,
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
