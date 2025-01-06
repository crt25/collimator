import { GeneralAst } from "@ast/index";
import { AstWalkSignal, walkAst } from "../ast-walk";
import {
  AstCriterionType,
  CriteriaBasedAnalyzerInput,
  CriteriaBasedAnalyzerOutput,
} from "../analyze-asts";

export const countExpressions = (
  ast: GeneralAst,
  _input: CriteriaBasedAnalyzerInput[AstCriterionType.expression],
): CriteriaBasedAnalyzerOutput[AstCriterionType.expression] => {
  let count = 0;

  walkAst(ast, {
    expressionCallback: () => {
      count++;

      return AstWalkSignal.continueWalking;
    },
  });

  return count;
};
