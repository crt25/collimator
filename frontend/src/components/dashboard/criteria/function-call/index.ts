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

const criterion = AstCriterionType.functionCall;
type Criterion = typeof criterion;

const messages = defineMessages({
  name: {
    id: "criteria.functionCall.name",
    defaultMessage: "Function Call",
  },
});

export interface FunctionCallFilterCriterion extends CriterionBase<Criterion> {
  functionName: string;
  minimumCount: number;
  maximumCount: number;
}

export interface FunctionCallFilterCriterionParameters
  extends CriterionBase<Criterion> {
  minCallsByFunctionName: {
    [functionName: string]: number;
  };
  maxCallsByFunctionName: {
    [functionName: string]: number;
  };
}

const toAnalysisInput = (
  functionCallCriterion: FunctionCallFilterCriterion,
): CriteriaToAnalyzeInput<Criterion> => {
  const name = functionCallCriterion.functionName?.trim();

  return {
    criterion,
    input: {
      functionName: name !== undefined && name.length > 0 ? name : undefined,
    },
  };
};

export const FunctionCallCriterionAxis: CriterionAxisDefinition<Criterion> = {
  criterion,
  messages: () => messages,
  config: {
    type: "linear",
    ticks: {
      precision: 0,
    },
  },
  getAxisValue: (analysis) => {
    const numberOfFunctionCalls = analyzeAst(analysis.generalAst, {
      criterion,
      input: {
        functionName: undefined,
      },
    }).output.numberOfCalls;

    return numberOfFunctionCalls;
  },
};

export const FunctionCallCriterionFilter: CriterionFilterDefinition<
  Criterion,
  FunctionCallFilterCriterion,
  FunctionCallFilterCriterionParameters
> = {
  criterion,
  formComponent: FunctionCallCriterionFilterForm,
  messages: () => messages,
  initialValues: {
    criterion,
    functionName: "",
    minimumCount: 0,
    maximumCount: 100,
  },
  run: (config, analyses) => {
    const outputs = analyses.map(
      (analysis) =>
        analyzeAst(analysis.generalAst, toAnalysisInput(config)).output,
    );

    const functionNames = new Set(
      outputs.flatMap((output) => Object.keys(output.callsByFunctionName)),
    );

    return {
      matchesFilter: outputs.map(
        (output) =>
          config.minimumCount <= output.numberOfCalls &&
          config.maximumCount >= output.numberOfCalls,
      ),
      parameters: {
        criterion,
        maxCallsByFunctionName: Object.fromEntries(
          functionNames
            .values()
            .map((funtionName) => [
              funtionName,
              Math.max(
                ...outputs.map(
                  (output) => output.callsByFunctionName[funtionName] ?? 0,
                ),
              ),
            ]),
        ),
        minCallsByFunctionName: Object.fromEntries(
          functionNames
            .values()
            .map((funtionName) => [
              funtionName,
              Math.min(
                ...outputs.map(
                  (output) => output.callsByFunctionName[funtionName] ?? 0,
                ),
              ),
            ]),
        ),
      },
    };
  },
};
