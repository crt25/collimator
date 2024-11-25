import { AstWalkSignal, walkAst } from "../ast-walk";
import {
  CriterionType,
  CriteriaBasedAnalyzerInput,
  CriteriaBasedAnalyzerOutput,
} from "../analyze-asts";
import { GeneralAst } from "@ast/index";
import { StatementNodeType } from "@ast/ast-nodes";

export const countFunctionDeclaration = (
  ast: GeneralAst,
  _input: CriteriaBasedAnalyzerInput[CriterionType.functionDeclaration],
): CriteriaBasedAnalyzerOutput[CriterionType.functionDeclaration] => {
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
