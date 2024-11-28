import { AstWalkSignal, walkAst } from "../ast-walk";
import {
  AstCriterionType,
  CriteriaBasedAnalyzerInput,
  CriteriaBasedAnalyzerOutput,
} from "../analyze-asts";
import { GeneralAst } from "@ast/index";
import { StatementNodeType } from "@ast/ast-nodes";

export const countLoops = (
  ast: GeneralAst,
  _input: CriteriaBasedAnalyzerInput[AstCriterionType.loop],
): CriteriaBasedAnalyzerOutput[AstCriterionType.loop] => {
  let loopCount = 0;

  walkAst(ast, {
    statementCallback: (node) => {
      if (node.statementType == StatementNodeType.loop) {
        loopCount++;
      }

      return AstWalkSignal.continueWalking;
    },
  });

  return loopCount;
};
