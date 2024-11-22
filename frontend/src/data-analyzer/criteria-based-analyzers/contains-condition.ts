import { AstWalkSignal, walkAst } from "../ast-walk";
import {
  Criterion,
  CriteriaBasedAnalyzerInput,
  CriteriaBasedAnalyzerOutput,
} from "../analyze-asts";
import { GeneralAst } from "@ast/index";
import { StatementNodeType } from "@ast/ast-nodes";

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
