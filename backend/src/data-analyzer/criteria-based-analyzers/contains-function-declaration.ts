import { GeneralAst } from "src/ast/types/general-ast";
import {
  Criteria,
  CriteriaBasedAnalyzerInput,
  CriteriaBasedAnalyzerOutput,
} from "../criteria-based-analyzer.service";
import { AstWalkSignal, walkAst } from "../ast-walk";
import { StatementNodeType } from "src/ast/types/general-ast/ast-nodes";

export const containsFunctionDeclaration = (
  ast: GeneralAst,
  _input: CriteriaBasedAnalyzerInput[Criteria.containsFunctionDeclaration],
): CriteriaBasedAnalyzerOutput[Criteria.containsFunctionDeclaration] => {
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
