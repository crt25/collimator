import { AstWalkSignal, walkAst } from "../ast-walk";
import {
  CriterionType,
  CriteriaBasedAnalyzerInput,
  CriteriaBasedAnalyzerOutput,
} from "../analyze-asts";
import { GeneralAst } from "@ast/index";

export const countStatements = (
  ast: GeneralAst,
  _input: CriteriaBasedAnalyzerInput[CriterionType.statement],
): CriteriaBasedAnalyzerOutput[CriterionType.statement] => {
  let count = 0;

  walkAst(ast, {
    statementCallback: () => {
      count++;

      return AstWalkSignal.continueWalking;
    },
  });

  return count;
};
