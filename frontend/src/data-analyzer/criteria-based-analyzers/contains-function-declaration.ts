import { AstWalkSignal, walkAst } from "../ast-walk";
import {
  Criterion,
  CriteriaBasedAnalyzerInput,
  CriteriaBasedAnalyzerOutput,
} from "../analyze-asts";
import { GeneralAst } from "@ast/index";
import { StatementNodeType } from "@ast/ast-nodes";

export const containsFunctionDeclaration = (
  ast: GeneralAst,
  _input: CriteriaBasedAnalyzerInput[Criterion.containsFunctionDeclaration],
): CriteriaBasedAnalyzerOutput[Criterion.containsFunctionDeclaration] => {
  let containsDeclaration = false;

  walkAst(ast, {
    statementCallback: (node) => {
      if (node.statementType == StatementNodeType.functionDeclaration) {
        containsDeclaration = true;

        // Stop walking the AST
        return AstWalkSignal.stopWalking;
      }

      return AstWalkSignal.continueWalking;
    },
  });

  return containsDeclaration;
};
