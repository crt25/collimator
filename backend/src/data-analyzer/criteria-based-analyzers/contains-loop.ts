import { GeneralAst } from "src/ast/types/general-ast";
import {
  Criteria,
  CriteriaBasedAnalyzerInput,
  CriteriaBasedAnalyzerOutput,
} from "../criteria-based-analyzer.service";
import { walkAst } from "../ast-walk";
import { StatementNodeType } from "src/ast/types/general-ast/ast-nodes";

export const containsLoop = (
  ast: GeneralAst,
  _input: CriteriaBasedAnalyzerInput[Criteria.containsLoop],
): CriteriaBasedAnalyzerOutput[Criteria.containsLoop] => {
  let containsLoop = false;

  walkAst(ast, {
    statementCallback: (node) => {
      if (node.statementType == StatementNodeType.loop) {
        containsLoop = true;

        // Stop walking the AST
        return false;
      }

      return true;
    },
  });

  return containsLoop;
};
