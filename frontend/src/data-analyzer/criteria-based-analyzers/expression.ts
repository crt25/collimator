import { AstWalkSignal, walkAst } from "../ast-walk";
import {
  CriterionType,
  CriteriaBasedAnalyzerInput,
  CriteriaBasedAnalyzerOutput,
} from "../analyze-asts";
import { GeneralAst } from "@ast/index";

export const countExpressions = (
  ast: GeneralAst,
  _input: CriteriaBasedAnalyzerInput[CriterionType.expression],
): CriteriaBasedAnalyzerOutput[CriterionType.expression] => {
  let count = 0;

  walkAst(ast, {
    expressionCallback: () => {
      count++;

      return AstWalkSignal.continueWalking;
    },
  });

  return count;
};
