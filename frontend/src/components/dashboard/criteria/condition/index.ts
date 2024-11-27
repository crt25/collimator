import { defineMessages } from "react-intl";
import {
  CriterionAxisDefinition,
  CriterionBase,
  CriterionFilterDefinition,
} from "../criterion-base";
import ConditionCriterionFilterForm from "./ConditionCriterionFilterForm";
import {
  analyzeAst,
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

const toAnalysisInput = (
  _criterion: ConditionFilterCriterion,
): CriteriaToAnalyzeInput<CriterionType.condition> => ({
  criterion: CriterionType.condition,
  input: undefined,
});

export const ConditionCriterionAxis: CriterionAxisDefinition<Criterion> = {
  criterion: CriterionType.condition,
  messages: () => messages,
  config: {
    type: "linear",
    min: 0,
  },
  getAxisValue: (analysis) => {
    const numberOfConditions = analyzeAst(analysis.generalAst, {
      criterion: CriterionType.condition,
      input: undefined,
    }).output;

    return numberOfConditions;
  },
};

export const ConditionCriterionFilter: CriterionFilterDefinition<
  Criterion,
  ConditionFilterCriterion
> = {
  criterion: CriterionType.condition,
  formComponent: ConditionCriterionFilterForm,
  messages: () => messages,
  matchesFilter: (config, analysis) => {
    const numberOfConditions = analyzeAst(
      analysis.generalAst,
      toAnalysisInput(config),
    ).output;

    return (
      config.minimumCount <= numberOfConditions &&
      config.maximumCount >= numberOfConditions
    );
  },
};
