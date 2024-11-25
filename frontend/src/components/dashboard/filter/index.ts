import { NoCriterionFilter } from "../criteria/none";
import { ConditionCriterionFilter } from "../criteria/condition";
import { DefinitionCriterion } from "../criteria/criterion-base";
import { FunctionCallCriterionFilter } from "../criteria/function-call";
import { StatementCriterionFilter } from "../criteria/statement";
import { ExpressionCriterionFilter } from "../criteria/expression";
import { LoopCriterionFilter } from "../criteria/loop";
import { FunctionDeclarationCriterionFilter } from "../criteria/function-declaration";
import {
  AnalysisInput,
  AnalysisOutput,
  CriterionType,
} from "@/data-analyzer/analyze-asts";
import { match } from "ts-pattern";

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

export const filterToAnalysisInput = (filter: AstFilter): AnalysisInput =>
  match(filter)
    .returnType<AnalysisInput>()
    .with({ criterion: CriterionType.none }, () => {
      throw new Error("Cannot convert 'no criterion' filter to analysis input");
    })
    .with(
      { criterion: CriterionType.statement },
      StatementCriterionFilter.toAnalysisInput,
    )
    .with(
      { criterion: CriterionType.expression },
      ExpressionCriterionFilter.toAnalysisInput,
    )
    .with(
      { criterion: CriterionType.condition },
      ConditionCriterionFilter.toAnalysisInput,
    )
    .with(
      { criterion: CriterionType.loop },
      LoopCriterionFilter.toAnalysisInput,
    )
    .with(
      { criterion: CriterionType.functionCall },
      FunctionCallCriterionFilter.toAnalysisInput,
    )
    .with(
      { criterion: CriterionType.functionDeclaration },
      FunctionDeclarationCriterionFilter.toAnalysisInput,
    )
    .exhaustive();

export const matchesFilter = (
  criterion: AstFilter,
  output: AnalysisOutput,
): boolean =>
  match([criterion, output])
    .with(
      [
        { criterion: CriterionType.statement },
        { criterion: CriterionType.statement },
      ],
      ([criterion, output]) =>
        StatementCriterionFilter.matchesFilter(criterion, output.output),
    )
    .with(
      [
        { criterion: CriterionType.expression },
        { criterion: CriterionType.expression },
      ],
      ([criterion, output]) =>
        ExpressionCriterionFilter.matchesFilter(criterion, output.output),
    )
    .with(
      [
        { criterion: CriterionType.condition },
        { criterion: CriterionType.condition },
      ],
      ([criterion, output]) =>
        ConditionCriterionFilter.matchesFilter(criterion, output.output),
    )
    .with(
      [{ criterion: CriterionType.loop }, { criterion: CriterionType.loop }],
      ([criterion, output]) =>
        LoopCriterionFilter.matchesFilter(criterion, output.output),
    )
    .with(
      [
        { criterion: CriterionType.functionCall },
        { criterion: CriterionType.functionCall },
      ],
      ([criterion, output]) =>
        FunctionCallCriterionFilter.matchesFilter(criterion, output.output),
    )
    .with(
      [
        { criterion: CriterionType.functionDeclaration },
        { criterion: CriterionType.functionDeclaration },
      ],
      ([criterion, output]) =>
        FunctionDeclarationCriterionFilter.matchesFilter(
          criterion,
          output.output,
        ),
    )
    .otherwise(() => {
      throw new Error("AST filter does not match output");
    });
