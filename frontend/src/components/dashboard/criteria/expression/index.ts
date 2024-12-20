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

const criterion = AstCriterionType.expression;
type Criterion = typeof criterion;

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

export interface ExpressionFilterCriterionParameters
  extends CriterionBase<Criterion> {
  minNumberOfExpressions: number;
  maxNumberOfExpressions: number;
}

const toAnalysisInput = (
  _criterion: ExpressionFilterCriterion,
): CriteriaToAnalyzeInput<Criterion> => ({
  criterion,
  input: undefined,
});

export const ExpressionCriterionAxis: CriterionAxisDefinition<Criterion> = {
  criterion,
  messages: () => messages,
  config: {
    type: "linear",
    ticks: {
      precision: 0,
    },
  },
  getAxisValue: (analysis) => {
    const numberOfExpressions = analyzeAst(analysis.generalAst, {
      criterion,
      input: undefined,
    }).output;

    return numberOfExpressions;
  },
};

export const ExpressionCriterionFilter: CriterionFilterDefinition<
  Criterion,
  ExpressionFilterCriterion,
  ExpressionFilterCriterionParameters
> = {
  criterion,
  formComponent: ExpressionCriterionFilterForm,
  messages: () => messages,
  initialValues: {
    criterion,
    minimumCount: 0,
    maximumCount: 100,
  },
  run: (config, analyses) => {
    const numberOfExpressionsList = analyses.map(
      (analysis) =>
        analyzeAst(analysis.generalAst, toAnalysisInput(config)).output,
    );

    return {
      matchesFilter: numberOfExpressionsList.map(
        (numberOfExpressions) =>
          config.minimumCount <= numberOfExpressions &&
          config.maximumCount >= numberOfExpressions,
      ),
      parameters: {
        criterion,
        maxNumberOfExpressions: Math.max(...numberOfExpressionsList),
        minNumberOfExpressions: Math.min(...numberOfExpressionsList),
      },
    };
  },
};
