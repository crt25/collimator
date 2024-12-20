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
  AstCriterionType,
} from "@/data-analyzer/analyze-asts";

const criterion = AstCriterionType.condition;
type Criterion = typeof criterion;

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

export interface ConditionFilterCriterionParameters
  extends CriterionBase<Criterion> {
  minNumberOfConditions: number;
  maxNumberOfConditions: number;
}

const toAnalysisInput = (
  _criterion: ConditionFilterCriterion,
): CriteriaToAnalyzeInput<Criterion> => ({
  criterion,
  input: undefined,
});

export const ConditionCriterionAxis: CriterionAxisDefinition<Criterion> = {
  criterion,
  messages: () => messages,
  config: {
    type: "linear",
    ticks: {
      precision: 0,
    },
  },
  getAxisValue: (analysis) => {
    const numberOfConditions = analyzeAst(analysis.generalAst, {
      criterion,
      input: undefined,
    }).output;

    return numberOfConditions;
  },
};

export const ConditionCriterionFilter: CriterionFilterDefinition<
  Criterion,
  ConditionFilterCriterion,
  ConditionFilterCriterionParameters
> = {
  criterion,
  formComponent: ConditionCriterionFilterForm,
  messages: () => messages,
  initialValues: {
    criterion,
    minimumCount: 0,
    maximumCount: 100,
  },
  run: (config, analyes) => {
    const numberOfConditionsList = analyes.map(
      (analysis) =>
        analyzeAst(analysis.generalAst, toAnalysisInput(config)).output,
    );

    return {
      matchesFilter: numberOfConditionsList.map(
        (numberOfConditions) =>
          config.minimumCount <= numberOfConditions &&
          config.maximumCount >= numberOfConditions,
      ),
      parameters: {
        criterion,
        minNumberOfConditions: Math.min(...numberOfConditionsList),
        maxNumberOfConditions: Math.max(...numberOfConditionsList),
      },
    };
  },
};
