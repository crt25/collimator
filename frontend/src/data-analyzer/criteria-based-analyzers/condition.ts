import { GeneralAst } from "@ast/index";
import { StatementNodeType } from "@ast/ast-nodes";
import { AstWalkSignal, walkAst } from "../ast-walk";
import {
  AstCriterionType,
  CriteriaBasedAnalyzerInput,
  CriteriaBasedAnalyzerOutput,
} from "../analyze-asts";

export const countConditions = (
  ast: GeneralAst,
  _input: CriteriaBasedAnalyzerInput[AstCriterionType.condition],
): CriteriaBasedAnalyzerOutput[AstCriterionType.condition] => {
  let conditions = 0;

  walkAst(ast, {
    statementCallback: (node) => {
      if (node.statementType == StatementNodeType.condition) {
        conditions++;
      }

      return AstWalkSignal.continueWalking;
    },
  });

  return conditions;
};
