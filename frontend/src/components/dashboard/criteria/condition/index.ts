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

type Criterion = AstCriterionType.condition;

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
): CriteriaToAnalyzeInput<AstCriterionType.condition> => ({
  criterion: AstCriterionType.condition,
  input: undefined,
});

export const ConditionCriterionAxis: CriterionAxisDefinition<Criterion> = {
  criterion: AstCriterionType.condition,
  messages: () => messages,
  config: {
    type: "linear",
    min: 0,
  },
  getAxisValue: (analysis) => {
    const numberOfConditions = analyzeAst(analysis.generalAst, {
      criterion: AstCriterionType.condition,
      input: undefined,
    }).output;

    return numberOfConditions;
  },
};

export const ConditionCriterionFilter: CriterionFilterDefinition<
  Criterion,
  ConditionFilterCriterion
> = {
  criterion: AstCriterionType.condition,
  formComponent: ConditionCriterionFilterForm,
  messages: () => messages,
  initialValues: {
    criterion: AstCriterionType.condition,
    minimumCount: 0,
    maximumCount: 100,
  },
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
