import { defineMessages } from "react-intl";
import {
  analyzeAst,
  CriteriaToAnalyzeInput,
  AstCriterionType,
} from "@/data-analyzer/analyze-asts";
import {
  CriterionAxisDefinition,
  CriterionBase,
  CriterionFilterDefinition,
} from "../criterion-base";
import CustomFunctionCallCriterionFilterForm from "./CustomFunctionCallCriterionFilterForm";

const criterion = AstCriterionType.customFunctionCall;
type Criterion = typeof criterion;

const messages = defineMessages({
  name: {
    id: "criteria.customFunctionCall.name",
    defaultMessage: "Custom Function Calls",
  },
});

export interface CustomFunctionCallFilterCriterion
  extends CriterionBase<Criterion> {
  minimumCount: number;
  maximumCount: number;
}

export interface CustomFunctionCallFilterCriterionParameters
  extends CriterionBase<Criterion> {
  minNumberOfCustomFunctionCalls: number;
  maxNumberOfCustomFunctionCalls: number;
}

const toAnalysisInput = (
  _config: CustomFunctionCallFilterCriterion,
): CriteriaToAnalyzeInput<Criterion> => ({
  criterion,
  input: undefined,
});

export const CustomFunctionCallCriterionAxis: CriterionAxisDefinition<Criterion> =
  {
    criterion,
    messages: () => messages,
    config: {
      type: "linear",
      ticks: {
        precision: 0,
      },
    },
    getAxisValue: (analysis) => {
      const numberOfCustomFunctionCalls = analyzeAst(analysis.generalAst, {
        criterion,
        input: undefined,
      }).output;

      return numberOfCustomFunctionCalls;
    },
  };

export const CustomFunctionCallCriterionFilter: CriterionFilterDefinition<
  Criterion,
  CustomFunctionCallFilterCriterion,
  CustomFunctionCallFilterCriterionParameters
> = {
  criterion,
  formComponent: CustomFunctionCallCriterionFilterForm,
  messages: () => messages,
  initialValues: {
    criterion,
    minimumCount: 0,
    maximumCount: 100,
  },
  run: (config, analyses) => {
    const numberOfCustomFunctionCallsList = analyses.map(
      (analysis) =>
        analyzeAst(analysis.generalAst, toAnalysisInput(config)).output,
    );

    return {
      matchesFilter: numberOfCustomFunctionCallsList.map(
        (numberOfCustomFunctionCalls) =>
          config.minimumCount <= numberOfCustomFunctionCalls &&
          config.maximumCount >= numberOfCustomFunctionCalls,
      ),
      parameters: {
        criterion,
        maxNumberOfCustomFunctionCalls: Math.max(
          ...numberOfCustomFunctionCallsList,
        ),
        minNumberOfCustomFunctionCalls: Math.min(
          ...numberOfCustomFunctionCallsList,
        ),
      },
    };
  },
};
