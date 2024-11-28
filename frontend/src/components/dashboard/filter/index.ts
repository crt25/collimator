import { NoCriterionFilter } from "../criteria/none";
import { ConditionCriterionFilter } from "../criteria/condition";
import { DefinitionCriterion } from "../criteria/criterion-base";
import { FunctionCallCriterionFilter } from "../criteria/function-call";
import { StatementCriterionFilter } from "../criteria/statement";
import { ExpressionCriterionFilter } from "../criteria/expression";
import { LoopCriterionFilter } from "../criteria/loop";
import { FunctionDeclarationCriterionFilter } from "../criteria/function-declaration";
import { AstCriterionType } from "@/data-analyzer/analyze-asts";
import { match } from "ts-pattern";
import { CurrentAnalysis } from "@/api/collimator/models/solutions/current-analysis";

export const filterCriteria = [
  NoCriterionFilter,
  StatementCriterionFilter,
  ExpressionCriterionFilter,
  ConditionCriterionFilter,
  LoopCriterionFilter,
  FunctionCallCriterionFilter,
  FunctionDeclarationCriterionFilter,
];

type FilterCriterionDefinition = (typeof filterCriteria)[number];
type FilterCriterion = DefinitionCriterion<FilterCriterionDefinition>;

export type FilterCriterionType = FilterCriterionDefinition["criterion"];

export type AstFilter = FilterCriterion;

export type FilterDefinitionByCriterion = {
  [key in FilterCriterionType]: FilterCriterionDefinition & {
    criterion: key;
  };
};

export const matchesFilter = (
  criterion: AstFilter,
  analysis: CurrentAnalysis,
): boolean =>
  match(criterion)
    .with({ criterion: AstCriterionType.none }, (criterion) =>
      NoCriterionFilter.matchesFilter(criterion, analysis),
    )
    .with({ criterion: AstCriterionType.statement }, (criterion) =>
      StatementCriterionFilter.matchesFilter(criterion, analysis),
    )
    .with({ criterion: AstCriterionType.expression }, (criterion) =>
      ExpressionCriterionFilter.matchesFilter(criterion, analysis),
    )
    .with({ criterion: AstCriterionType.condition }, (criterion) =>
      ConditionCriterionFilter.matchesFilter(criterion, analysis),
    )
    .with({ criterion: AstCriterionType.loop }, (criterion) =>
      LoopCriterionFilter.matchesFilter(criterion, analysis),
    )
    .with({ criterion: AstCriterionType.functionCall }, (criterion) =>
      FunctionCallCriterionFilter.matchesFilter(criterion, analysis),
    )
    .with({ criterion: AstCriterionType.functionDeclaration }, (criterion) =>
      FunctionDeclarationCriterionFilter.matchesFilter(criterion, analysis),
    )
    .exhaustive();
