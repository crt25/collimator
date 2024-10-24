import { GeneralAst } from "src/ast/types/general-ast";
import {
  Criteria,
  CriteriaBasedAnalyzerInput,
  CriteriaBasedAnalyzerOutput,
} from "../criteria-based-analyzer.service";
import { StatementNodeType } from "src/ast/types/general-ast/ast-nodes";
import { walkAst } from "../ast-walk";

export const containsCondition = (
  ast: GeneralAst,
  _input: CriteriaBasedAnalyzerInput[Criteria.containsCondition],
): CriteriaBasedAnalyzerOutput[Criteria.containsCondition] => {
  let containsCondition = false;

  walkAst(ast, {
    statementCallback: (node) => {
      if (node.statementType == StatementNodeType.condition) {
        containsCondition = true;

        // Stop walking the AST
        return false;
      }

      return true;
    },
  });

  return containsCondition;
};
