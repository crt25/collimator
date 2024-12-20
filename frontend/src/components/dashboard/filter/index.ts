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
import { TestCriterionFilter } from "../criteria/test";
import { MetaCriterionType } from "../criteria/meta-criterion-type";
import { AstHeightCriterionFilter } from "../criteria/ast-height";

export const filterCriteria = [
  ConditionCriterionFilter,
  ExpressionCriterionFilter,
  FunctionCallCriterionFilter,
  FunctionDeclarationCriterionFilter,
  LoopCriterionFilter,
  NoCriterionFilter,
  StatementCriterionFilter,
  TestCriterionFilter,
  AstHeightCriterionFilter,
];

type FilterCriterionDefinition = (typeof filterCriteria)[number];
export type FilterCriterion = DefinitionCriterion<FilterCriterionDefinition>;

export type FilterCriterionType = FilterCriterionDefinition["criterion"];

export type FilterDefinitionByCriterion = {
  [key in FilterCriterionType]: FilterCriterionDefinition & {
    criterion: key;
  };
};

export const matchesFilter = (
  criterion: FilterCriterion,
  analysis: CurrentAnalysis,
): boolean =>
  match(criterion)
    .with({ criterion: AstCriterionType.condition }, (criterion) =>
      ConditionCriterionFilter.matchesFilter(criterion, analysis),
    )
    .with({ criterion: AstCriterionType.expression }, (criterion) =>
      ExpressionCriterionFilter.matchesFilter(criterion, analysis),
    )
    .with({ criterion: AstCriterionType.functionCall }, (criterion) =>
      FunctionCallCriterionFilter.matchesFilter(criterion, analysis),
    )
    .with({ criterion: AstCriterionType.functionDeclaration }, (criterion) =>
      FunctionDeclarationCriterionFilter.matchesFilter(criterion, analysis),
    )
    .with({ criterion: AstCriterionType.height }, (criterion) =>
      AstHeightCriterionFilter.matchesFilter(criterion, analysis),
    )
    .with({ criterion: AstCriterionType.loop }, (criterion) =>
      LoopCriterionFilter.matchesFilter(criterion, analysis),
    )
    .with({ criterion: MetaCriterionType.none }, (criterion) =>
      NoCriterionFilter.matchesFilter(criterion, analysis),
    )
    .with({ criterion: AstCriterionType.statement }, (criterion) =>
      StatementCriterionFilter.matchesFilter(criterion, analysis),
    )
    .with({ criterion: MetaCriterionType.test }, (criterion) =>
      TestCriterionFilter.matchesFilter(criterion, analysis),
    )
    .exhaustive();

export const getInitialFilterValues = (
  criterion: FilterCriterionType,
): FilterCriterion =>
  match(criterion)
    .with(
      AstCriterionType.condition,
      () => ConditionCriterionFilter.initialValues,
    )
    .with(
      AstCriterionType.expression,
      () => ExpressionCriterionFilter.initialValues,
    )
    .with(
      AstCriterionType.functionCall,
      () => FunctionCallCriterionFilter.initialValues,
    )
    .with(
      AstCriterionType.functionDeclaration,
      () => FunctionDeclarationCriterionFilter.initialValues,
    )
    .with(AstCriterionType.height, () => AstHeightCriterionFilter.initialValues)
    .with(AstCriterionType.loop, () => LoopCriterionFilter.initialValues)
    .with(MetaCriterionType.none, () => NoCriterionFilter.initialValues)
    .with(MetaCriterionType.test, () => TestCriterionFilter.initialValues)
    .with(
      AstCriterionType.statement,
      () => StatementCriterionFilter.initialValues,
    )
    .exhaustive();
