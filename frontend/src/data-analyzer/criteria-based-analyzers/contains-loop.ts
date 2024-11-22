import { AstWalkSignal, walkAst } from "../ast-walk";
import {
  CriterionType,
  CriteriaBasedAnalyzerInput,
  CriteriaBasedAnalyzerOutput,
} from "../analyze-asts";
import { GeneralAst } from "@ast/index";
import { StatementNodeType } from "@ast/ast-nodes";

export const containsLoop = (
  ast: GeneralAst,
  _input: CriteriaBasedAnalyzerInput[CriterionType.containsLoop],
): CriteriaBasedAnalyzerOutput[CriterionType.containsLoop] => {
  let containsLoop = false;

  walkAst(ast, {
    statementCallback: (node) => {
      if (node.statementType == StatementNodeType.loop) {
        containsLoop = true;

        // Stop walking the AST
        return AstWalkSignal.stopWalking;
      }

      return AstWalkSignal.continueWalking;
    },
  });

  return containsLoop;
};
