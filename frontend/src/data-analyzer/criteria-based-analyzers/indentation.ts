import { GeneralAst } from "@ast/index";
import { AstWalkSignal, walkAst } from "../ast-walk";
import {
  AstCriterionType,
  CriteriaBasedAnalyzerInput,
  CriteriaBasedAnalyzerOutput,
} from "../analyze-asts";

export const computeIndentation = (
  ast: GeneralAst,
  _input: CriteriaBasedAnalyzerInput[AstCriterionType.height],
): CriteriaBasedAnalyzerOutput[AstCriterionType.height] => {
  let maxIndentation = 0;

  // similar to the height criterion but we only look at statements

  const callback = (
    _node: unknown,
    _depth: number,
    indentation: number,
  ): AstWalkSignal => {
    maxIndentation = Math.max(maxIndentation, indentation);

    return AstWalkSignal.continueWalking;
  };

  walkAst(ast, {
    statementCallback: callback,
  });

  return maxIndentation;
};
