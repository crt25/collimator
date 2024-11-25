import { defineMessages } from "react-intl";
import {
  CriterionAxisDefinition,
  CriterionBase,
  CriterionFilterDefinition,
  CriterionGroupDefinition,
} from "../criterion-base";
import ConditionCriterionFilterForm from "./ConditionCriterionFilterForm";
import ConditionCriterionGroupForm from "./ConditionCriterionGroupForm";
import {
  CriteriaToAnalyzeInput,
  CriterionType,
} from "@/data-analyzer/analyze-asts";

type Criterion = CriterionType.condition;

const messages = defineMessages({
  name: {
    id: "criteria.condition.name",
    defaultMessage: "If",
  },
});

export interface ConditionFilterCriterion extends CriterionBase<Criterion> {
  minimumCount: number;
  maximumCount: number;
}

export interface ConditionGroupCriterion extends CriterionBase<Criterion> {
  granularity: number;
}

const toAnalysisInput = (
  _criterion: ConditionFilterCriterion | ConditionGroupCriterion,
): CriteriaToAnalyzeInput<CriterionType.condition> => ({
  criterion: CriterionType.condition,
  input: undefined,
});

export const ConditionCriterionAxis: CriterionAxisDefinition<Criterion> = {
  criterion: CriterionType.condition,
  messages: () => messages,
  analysisInput: {
    criterion: CriterionType.condition,
    input: undefined,
  },
  getAxisValue: (numberOfConditions) => numberOfConditions,
};

export const ConditionCriterionFilter: CriterionFilterDefinition<
  Criterion,
  ConditionFilterCriterion
> = {
  criterion: CriterionType.condition,
  formComponent: ConditionCriterionFilterForm,
  messages: () => messages,
  toAnalysisInput,
  matchesFilter: (config, numberOfConditions) =>
    config.minimumCount <= numberOfConditions &&
    config.maximumCount >= numberOfConditions,
};

export const ConditionCriterionGroup: CriterionGroupDefinition<
  Criterion,
  ConditionGroupCriterion
> = {
  criterion: CriterionType.condition,
  formComponent: ConditionCriterionGroupForm,
  messages: () => messages,
  toAnalysisInput,
  getGroup: (config, numberOfConditions) =>
    Math.round(numberOfConditions / config.granularity).toString(),
};
