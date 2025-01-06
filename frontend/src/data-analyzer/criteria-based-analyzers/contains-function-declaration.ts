import { GeneralAst } from "@ast/index";
import { StatementNodeType } from "@ast/ast-nodes";
import { AstWalkSignal, walkAst } from "../ast-walk";
import {
  AstCriterionType,
  CriteriaBasedAnalyzerInput,
  CriteriaBasedAnalyzerOutput,
} from "../analyze-asts";

export const countFunctionDeclaration = (
  ast: GeneralAst,
  _input: CriteriaBasedAnalyzerInput[AstCriterionType.functionDeclaration],
): CriteriaBasedAnalyzerOutput[AstCriterionType.functionDeclaration] => {
  let declarations = 0;

  walkAst(ast, {
    statementCallback: (node) => {
      if (node.statementType == StatementNodeType.functionDeclaration) {
        declarations++;
      }

      return AstWalkSignal.continueWalking;
    },
  });

  return declarations;
};
