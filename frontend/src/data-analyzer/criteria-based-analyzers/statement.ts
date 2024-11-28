import { AstWalkSignal, walkAst } from "../ast-walk";
import {
  AstCriterionType,
  CriteriaBasedAnalyzerInput,
  CriteriaBasedAnalyzerOutput,
} from "../analyze-asts";
import { GeneralAst } from "@ast/index";

export const countStatements = (
  ast: GeneralAst,
  _input: CriteriaBasedAnalyzerInput[AstCriterionType.statement],
): CriteriaBasedAnalyzerOutput[AstCriterionType.statement] => {
  let count = 0;

  walkAst(ast, {
    statementCallback: () => {
      count++;

      return AstWalkSignal.continueWalking;
    },
  });

  return count;
};
