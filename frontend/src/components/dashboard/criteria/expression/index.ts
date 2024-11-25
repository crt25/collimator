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
import ExpressionCriterionFilterForm from "./ExpressionCriterionFilterForm";
import ExpressionCriterionGroupForm from "./ExpressionCriterionGroupForm";

type Criterion = CriterionType.expression;

const messages = defineMessages({
  name: {
    id: "criteria.expression.name",
    defaultMessage: "Expression",
  },
});

export interface ExpressionFilterCriterion extends CriterionBase<Criterion> {
  minimumCount: number;
  maximumCount: number;
}

export interface ExpressionGroupCriterion extends CriterionBase<Criterion> {
  granularity: number;
}

const toAnalysisInput = (
  _criterion: ExpressionFilterCriterion | ExpressionGroupCriterion,
): CriteriaToAnalyzeInput<CriterionType.expression> => ({
  criterion: CriterionType.expression,
  input: undefined,
});

export const ExpressionCriterionAxis: CriterionAxisDefinition<Criterion> = {
  criterion: CriterionType.expression,
  messages: () => messages,
  analysisInput: {
    criterion: CriterionType.expression,
    input: undefined,
  },
  getAxisValue: (numberOfExpressions) => numberOfExpressions,
};

export const ExpressionCriterionFilter: CriterionFilterDefinition<
  Criterion,
  ExpressionFilterCriterion
> = {
  criterion: CriterionType.expression,
  formComponent: ExpressionCriterionFilterForm,
  messages: () => messages,
  toAnalysisInput,
  matchesFilter: (config, numberOfExpressions) =>
    config.minimumCount <= numberOfExpressions &&
    config.maximumCount >= numberOfExpressions,
};

export const ExpressionCriterionGroup: CriterionGroupDefinition<
  Criterion,
  ExpressionGroupCriterion
> = {
  criterion: CriterionType.expression,
  formComponent: ExpressionCriterionGroupForm,
  messages: () => messages,
  toAnalysisInput,
  getGroup: (config, numberOfExpressions) =>
    Math.round(numberOfExpressions / config.granularity).toString(),
};
