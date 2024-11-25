import { AstWalkSignal, walkAst } from "../ast-walk";
import {
  CriterionType,
  CriteriaBasedAnalyzerInput,
  CriteriaBasedAnalyzerOutput,
} from "../analyze-asts";
import { GeneralAst } from "@ast/index";
import { StatementNodeType } from "@ast/ast-nodes";

export const countConditions = (
  ast: GeneralAst,
  _input: CriteriaBasedAnalyzerInput[CriterionType.condition],
): CriteriaBasedAnalyzerOutput[CriterionType.condition] => {
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
