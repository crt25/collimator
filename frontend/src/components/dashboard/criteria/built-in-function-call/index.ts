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
import BuiltInFunctionCallCriterionFilterForm from "./FunctionCallCriterionFilterForm";

const criterion = AstCriterionType.builtInFunctionCall;
type Criterion = typeof criterion;

const messages = defineMessages({
  name: {
    id: "criteria.builtInFunctionCall.name",
    defaultMessage: "Built-in Function Calls",
  },
});

export interface BuiltInFunctionCallFilterCriterion
  extends CriterionBase<Criterion> {
  functionName: string;
  minimumCount: number;
  maximumCount: number;
}

export interface BuiltInFunctionCallFilterCriterionParameters
  extends CriterionBase<Criterion> {
  minCallsByFunctionName: {
    [functionName: string]: number;
  };
  maxCallsByFunctionName: {
    [functionName: string]: number;
  };
}

const toAnalysisInput = (
  functionCallCriterion: BuiltInFunctionCallFilterCriterion,
): CriteriaToAnalyzeInput<Criterion> => {
  const name = functionCallCriterion.functionName?.trim();

  return {
    criterion,
    input: {
      functionName: name !== undefined && name.length > 0 ? name : undefined,
    },
  };
};

export const BuiltInFunctionCallCriterionAxis: CriterionAxisDefinition<Criterion> =
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
      const numberOfFunctionCalls = analyzeAst(analysis.generalAst, {
        criterion,
        input: {
          functionName: undefined,
        },
      }).output.numberOfCalls;

      return numberOfFunctionCalls;
    },
  };

export const BuiltInFunctionCallCriterionFilter: CriterionFilterDefinition<
  Criterion,
  BuiltInFunctionCallFilterCriterion,
  BuiltInFunctionCallFilterCriterionParameters
> = {
  criterion,
  formComponent: BuiltInFunctionCallCriterionFilterForm,
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
