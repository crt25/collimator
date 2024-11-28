import { defineMessages } from "react-intl";
import {
  CriterionAxisDefinition,
  CriterionBase,
  CriterionFilterDefinition,
} from "../criterion-base";
import FunctionCallCriterionFilterForm from "./FunctionCallCriterionFilterForm";
import {
  analyzeAst,
  CriteriaToAnalyzeInput,
  AstCriterionType,
} from "@/data-analyzer/analyze-asts";

type Criterion = AstCriterionType.functionCall;

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

const toAnalysisInput = (
  criterion: FunctionCallFilterCriterion,
): CriteriaToAnalyzeInput<AstCriterionType.functionCall> => {
  const name = criterion.functionName?.trim();

  return {
    criterion: AstCriterionType.functionCall,
    input: {
      functionName: name !== undefined && name.length > 0 ? name : undefined,
    },
  };
};

export const FunctionCallCriterionAxis: CriterionAxisDefinition<Criterion> = {
  criterion: AstCriterionType.functionCall,
  messages: () => messages,
  config: {
    type: "linear",
    min: 0,
  },
  getAxisValue: (analysis) => {
    const numberOfFunctionCalls = analyzeAst(analysis.generalAst, {
      criterion: AstCriterionType.functionCall,
      input: {
        functionName: undefined,
      },
    }).output;

    return numberOfFunctionCalls;
  },
};

export const FunctionCallCriterionFilter: CriterionFilterDefinition<
  Criterion,
  FunctionCallFilterCriterion
> = {
  criterion: AstCriterionType.functionCall,
  formComponent: FunctionCallCriterionFilterForm,
  messages: () => messages,
  matchesFilter: (config, analysis) => {
    const numberOfFunctionCalls = analyzeAst(
      analysis.generalAst,
      toAnalysisInput(config),
    ).output;

    return (
      config.minimumCount <= numberOfFunctionCalls &&
      config.maximumCount >= numberOfFunctionCalls
    );
  },
};
