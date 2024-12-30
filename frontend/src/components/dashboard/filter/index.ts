import { NoCriterionFilter } from "../criteria/none";
import { ConditionCriterionFilter } from "../criteria/condition";
import {
  DefinitionCriterion,
  FilterDefinitionParameters,
} from "../criteria/criterion-base";
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
import { IndentationCriterionFilter } from "../criteria/indentation";

export const filterCriteria = [
  // always keep that first in the list
  NoCriterionFilter,
  ConditionCriterionFilter,
  ExpressionCriterionFilter,
  FunctionCallCriterionFilter,
  FunctionDeclarationCriterionFilter,
  LoopCriterionFilter,
  StatementCriterionFilter,
  TestCriterionFilter,
  IndentationCriterionFilter,
  AstHeightCriterionFilter,
];

type FilterCriterionDefinition = (typeof filterCriteria)[number];
export type FilterCriterion = DefinitionCriterion<FilterCriterionDefinition>;
export type FilterCriterionParameters =
  FilterDefinitionParameters<FilterCriterionDefinition>;

export type FilterCriterionType = FilterCriterionDefinition["criterion"];

export type FilterDefinitionByCriterion = {
  [key in FilterCriterionType]: FilterCriterionDefinition & {
    criterion: key;
  };
};

export const runFilter = (
  criterion: FilterCriterion,
  analyses: CurrentAnalysis[],
): {
  matchesFilter: boolean[];
  parameters: FilterCriterionParameters;
} =>
  match(criterion)
    .returnType<{
      matchesFilter: boolean[];
      parameters: FilterCriterionParameters;
    }>()
    .with({ criterion: AstCriterionType.condition }, (criterion) =>
      ConditionCriterionFilter.run(criterion, analyses),
    )
    .with({ criterion: AstCriterionType.expression }, (criterion) =>
      ExpressionCriterionFilter.run(criterion, analyses),
    )
    .with({ criterion: AstCriterionType.functionCall }, (criterion) =>
      FunctionCallCriterionFilter.run(criterion, analyses),
    )
    .with({ criterion: AstCriterionType.functionDeclaration }, (criterion) =>
      FunctionDeclarationCriterionFilter.run(criterion, analyses),
    )
    .with({ criterion: AstCriterionType.height }, (criterion) =>
      AstHeightCriterionFilter.run(criterion, analyses),
    )
    .with({ criterion: AstCriterionType.indentation }, (criterion) =>
      IndentationCriterionFilter.run(criterion, analyses),
    )
    .with({ criterion: AstCriterionType.loop }, (criterion) =>
      LoopCriterionFilter.run(criterion, analyses),
    )
    .with({ criterion: MetaCriterionType.none }, (criterion) =>
      NoCriterionFilter.run(criterion, analyses),
    )
    .with({ criterion: AstCriterionType.statement }, (criterion) =>
      StatementCriterionFilter.run(criterion, analyses),
    )
    .with({ criterion: MetaCriterionType.test }, (criterion) =>
      TestCriterionFilter.run(criterion, analyses),
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
    .with(
      AstCriterionType.indentation,
      () => IndentationCriterionFilter.initialValues,
    )
    .with(AstCriterionType.loop, () => LoopCriterionFilter.initialValues)
    .with(MetaCriterionType.none, () => NoCriterionFilter.initialValues)
    .with(MetaCriterionType.test, () => TestCriterionFilter.initialValues)
    .with(
      AstCriterionType.statement,
      () => StatementCriterionFilter.initialValues,
    )
    .exhaustive();
