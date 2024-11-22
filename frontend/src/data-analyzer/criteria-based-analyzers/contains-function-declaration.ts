import { AstWalkSignal, walkAst } from "../ast-walk";
import {
  CriterionType,
  CriteriaBasedAnalyzerInput,
  CriteriaBasedAnalyzerOutput,
} from "../analyze-asts";
import { GeneralAst } from "@ast/index";
import { StatementNodeType } from "@ast/ast-nodes";

export const containsFunctionDeclaration = (
  ast: GeneralAst,
  _input: CriteriaBasedAnalyzerInput[CriterionType.containsFunctionDeclaration],
): CriteriaBasedAnalyzerOutput[CriterionType.containsFunctionDeclaration] => {
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
