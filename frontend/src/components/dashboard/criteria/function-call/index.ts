import { defineMessages } from "react-intl";
import {
  CriterionAxisDefinition,
  CriterionBase,
  CriterionFilterDefinition,
  CriterionGroupDefinition,
} from "../criterion-base";
import FunctionCallCriterionFilterForm from "./FunctionCallCriterionFilterForm";
import FunctionCallCriterionGroupForm from "./FunctionCallCriterionGroupForm";
import {
  CriteriaToAnalyzeInput,
  CriterionType,
} from "@/data-analyzer/analyze-asts";

type Criterion = CriterionType.functionCall;

const messages = defineMessages({
  name: {
    id: "criteria.functionCall.name",
    defaultMessage: "Function Call",
  },
});

export interface FunctionCallFilterCriterion extends CriterionBase<Criterion> {
  functionName?: string;
  minimumCount: number;
  maximumCount: number;
}

export interface FunctionCallGroupCriterion extends CriterionBase<Criterion> {
  functionName?: string;
  granularity: number;
}

const toAnalysisInput = (
  criterion: FunctionCallFilterCriterion | FunctionCallGroupCriterion,
): CriteriaToAnalyzeInput<CriterionType.functionCall> => {
  const name = criterion.functionName?.trim();

  return {
    criterion: CriterionType.functionCall,
    input: {
      functionName: name !== undefined && name.length > 0 ? name : undefined,
    },
  };
};

export const FunctionCallCriterionAxis: CriterionAxisDefinition<Criterion> = {
  criterion: CriterionType.functionCall,
  messages: () => messages,
  analysisInput: {
    criterion: CriterionType.functionCall,
    input: {
      functionName: undefined,
    },
  },
  config: {
    type: "linear",
    min: 0,
  },
  getAxisValue: (numberOfFunctionCalls) => numberOfFunctionCalls,
};

export const FunctionCallCriterionFilter: CriterionFilterDefinition<
  Criterion,
  FunctionCallFilterCriterion
> = {
  criterion: CriterionType.functionCall,
  formComponent: FunctionCallCriterionFilterForm,
  messages: () => messages,
  toAnalysisInput,
  matchesFilter: (config, numberOfFunctionCalls) =>
    config.minimumCount <= numberOfFunctionCalls &&
    config.maximumCount >= numberOfFunctionCalls,
};

export const FunctionCallCriterionGroup: CriterionGroupDefinition<
  Criterion,
  FunctionCallGroupCriterion
> = {
  criterion: CriterionType.functionCall,
  formComponent: FunctionCallCriterionGroupForm,
  messages: () => messages,
  toAnalysisInput,
  getGroup: (config, numberOfFunctionCalls) =>
    Math.round(numberOfFunctionCalls / config.granularity).toString(),
};
