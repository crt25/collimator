import { GeneralAst } from "@ast/index";
import { StatementNodeType } from "@ast/ast-nodes";
import { AstWalkSignal, walkAst } from "../ast-walk";
import {
  AstCriterionType,
  CriteriaBasedAnalyzerInput,
  CriteriaBasedAnalyzerOutput,
} from "../analyze-asts";

export const countStatements = (
  ast: GeneralAst,
  _input: CriteriaBasedAnalyzerInput[AstCriterionType.statement],
): CriteriaBasedAnalyzerOutput[AstCriterionType.statement] => {
  let count = 0;

  walkAst(ast, {
    statementCallback: (node) => {
      // We only want to count the statement nodes that are not sequences
      if (node.statementType !== StatementNodeType.sequence) {
        count++;
      }

      return AstWalkSignal.continueWalking;
    },
  });

  return count;
};
