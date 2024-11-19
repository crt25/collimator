import { GeneralAst } from "src/ast/types/general-ast";
import { AstWalkSignal, walkAst } from "../ast-walk";
import { StatementNodeType } from "src/ast/types/general-ast/ast-nodes";
import {
  Criterion,
  CriteriaBasedAnalyzerInput,
  CriteriaBasedAnalyzerOutput,
} from "../criteria-based-analysis-worker.piscina";

export const containsLoop = (
  ast: GeneralAst,
  _input: CriteriaBasedAnalyzerInput[Criterion.containsLoop],
): CriteriaBasedAnalyzerOutput[Criterion.containsLoop] => {
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
