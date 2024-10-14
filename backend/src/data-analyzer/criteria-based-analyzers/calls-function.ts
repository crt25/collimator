import { GeneralAst } from "src/ast/types/general-ast";
import {
  Criteria,
  CriteriaBasedAnalyzerInput,
  CriteriaBasedAnalyzerOutput,
} from "../criteria-based-analyzer.service";
import { walkAst } from "../ast-walk";
import { StatementNodeType } from "src/ast/types/general-ast/ast-nodes";
import { ExpressionNodeType } from "src/ast/types/general-ast/ast-nodes/expression-node";

export const callsFunction = (
  ast: GeneralAst,
  input: Exclude<CriteriaBasedAnalyzerInput[Criteria.callsFunction], undefined>,
): CriteriaBasedAnalyzerOutput[Criteria.callsFunction] => {
  let callsFunction = false;

  walkAst(ast, {
    statementCallback: (node) => {
      if (node.statementType == StatementNodeType.functionCall) {
        if (node.name == input.functionName) {
          callsFunction = true;

          // Stop walking the AST
          return false;
        }
      }

      return true;
    },

    expressionCallback: (node) => {
      if (node.expressionType == ExpressionNodeType.functionCall) {
        if (node.name == input.functionName) {
          callsFunction = true;

          // Stop walking the AST
          return true;
        }
      }

      return false;
    },
  });

  return callsFunction;
};
