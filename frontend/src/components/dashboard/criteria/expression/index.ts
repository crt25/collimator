import { defineMessages } from "react-intl";
import {
  CriterionAxisDefinition,
  CriterionBase,
  CriterionFilterDefinition,
  CriterionGroupDefinition,
} from "../criterion-base";
import {
  analyzeAst,
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
  config: {
    type: "linear",
    min: 0,
  },
  getAxisValue: (analysis) => {
    const numberOfExpressions = analyzeAst(analysis.generalAst, {
      criterion: CriterionType.expression,
      input: undefined,
    }).output;

    return numberOfExpressions;
  },
};

export const ExpressionCriterionFilter: CriterionFilterDefinition<
  Criterion,
  ExpressionFilterCriterion
> = {
  criterion: CriterionType.expression,
  formComponent: ExpressionCriterionFilterForm,
  messages: () => messages,
  matchesFilter: (config, analysis) => {
    const numberOfExpressions = analyzeAst(
      analysis.generalAst,
      toAnalysisInput(config),
    ).output;

    return (
      config.minimumCount <= numberOfExpressions &&
      config.maximumCount >= numberOfExpressions
    );
  },
};

export const ExpressionCriterionGroup: CriterionGroupDefinition<
  Criterion,
  ExpressionGroupCriterion
> = {
  criterion: CriterionType.expression,
  formComponent: ExpressionCriterionGroupForm,
  messages: () => messages,
  getGroup: (config, analysis) => {
    const numberOfExpressions = analyzeAst(
      analysis.generalAst,
      toAnalysisInput(config),
    ).output;

    return Math.round(numberOfExpressions / config.granularity).toString();
  },
};
