import { defineMessages } from "react-intl";
import {
  CriterionAxisDefinition,
  CriterionBase,
  CriterionFilterDefinition,
} from "../criterion-base";
import {
  analyzeAst,
  CriteriaToAnalyzeInput,
  AstCriterionType,
} from "@/data-analyzer/analyze-asts";
import ExpressionCriterionFilterForm from "./ExpressionCriterionFilterForm";

type Criterion = AstCriterionType.expression;

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

const toAnalysisInput = (
  _criterion: ExpressionFilterCriterion,
): CriteriaToAnalyzeInput<AstCriterionType.expression> => ({
  criterion: AstCriterionType.expression,
  input: undefined,
});

export const ExpressionCriterionAxis: CriterionAxisDefinition<Criterion> = {
  criterion: AstCriterionType.expression,
  messages: () => messages,
  config: {
    type: "linear",
    min: 0,
  },
  getAxisValue: (analysis) => {
    const numberOfExpressions = analyzeAst(analysis.generalAst, {
      criterion: AstCriterionType.expression,
      input: undefined,
    }).output;

    return numberOfExpressions;
  },
};

export const ExpressionCriterionFilter: CriterionFilterDefinition<
  Criterion,
  ExpressionFilterCriterion
> = {
  criterion: AstCriterionType.expression,
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
