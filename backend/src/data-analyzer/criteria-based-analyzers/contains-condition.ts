import { GeneralAst } from "src/ast/types/general-ast";
import { StatementNodeType } from "src/ast/types/general-ast/ast-nodes";
import { AstWalkSignal, walkAst } from "../ast-walk";
import {
  Criterion,
  CriteriaBasedAnalyzerInput,
  CriteriaBasedAnalyzerOutput,
} from "../criteria-based-analysis-worker.piscina";

export const containsCondition = (
  ast: GeneralAst,
  _input: CriteriaBasedAnalyzerInput[Criterion.containsCondition],
): CriteriaBasedAnalyzerOutput[Criterion.containsCondition] => {
  let containsCondition = false;

  walkAst(ast, {
    statementCallback: (node) => {
      if (node.statementType == StatementNodeType.condition) {
        containsCondition = true;

        // Stop walking the AST
        return AstWalkSignal.stopWalking;
      }

      return AstWalkSignal.continueWalking;
    },
  });

  return containsCondition;
};
