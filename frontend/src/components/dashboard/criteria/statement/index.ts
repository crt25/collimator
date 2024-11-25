import { defineMessages } from "react-intl";
import {
  CriterionAxisDefinition,
  CriterionBase,
  CriterionFilterDefinition,
  CriterionGroupDefinition,
} from "../criterion-base";
import {
  CriteriaToAnalyzeInput,
  CriterionType,
} from "@/data-analyzer/analyze-asts";
import StatementCriterionFilterForm from "./StatementCriterionFilterForm";
import StatementCriterionGroupForm from "./StatementCriterionGroupForm";

type Criterion = CriterionType.statement;

const messages = defineMessages({
  name: {
    id: "criteria.statement.name",
    defaultMessage: "Statement",
  },
});

export interface StatementFilterCriterion extends CriterionBase<Criterion> {
  minimumCount: number;
  maximumCount: number;
}

export interface StatementGroupCriterion extends CriterionBase<Criterion> {
  granularity: number;
}

const toAnalysisInput = (
  _criterion: StatementFilterCriterion | StatementGroupCriterion,
): CriteriaToAnalyzeInput<CriterionType.statement> => ({
  criterion: CriterionType.statement,
  input: undefined,
});

export const StatementCriterionAxis: CriterionAxisDefinition<Criterion> = {
  criterion: CriterionType.statement,
  messages: () => messages,
  analysisInput: {
    criterion: CriterionType.statement,
    input: undefined,
  },
  config: {
    type: "linear",
    min: 0,
  },
  getAxisValue: (numberOfStatements) => numberOfStatements,
};

export const StatementCriterionFilter: CriterionFilterDefinition<
  Criterion,
  StatementFilterCriterion
> = {
  criterion: CriterionType.statement,
  formComponent: StatementCriterionFilterForm,
  messages: () => messages,
  toAnalysisInput,
  matchesFilter: (config, numberOfStatements) =>
    config.minimumCount <= numberOfStatements &&
    config.maximumCount >= numberOfStatements,
};

export const StatementCriterionGroup: CriterionGroupDefinition<
  Criterion,
  StatementGroupCriterion
> = {
  criterion: CriterionType.statement,
  formComponent: StatementCriterionGroupForm,
  messages: () => messages,
  toAnalysisInput,
  getGroup: (config, numberOfStatements) =>
    Math.round(numberOfStatements / config.granularity).toString(),
};
