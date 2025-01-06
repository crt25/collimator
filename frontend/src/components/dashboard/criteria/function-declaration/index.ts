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
import FunctionDeclarationCriterionFilterForm from "./FunctionDeclarationCriterionFilterForm";

const criterion = AstCriterionType.functionDeclaration;
type Criterion = typeof criterion;

const messages = defineMessages({
  name: {
    id: "criteria.functionDeclaration.name",
    defaultMessage: "Function Declaration",
  },
});

export interface FunctionDeclarationFilterCriterion
  extends CriterionBase<Criterion> {
  minimumCount: number;
  maximumCount: number;
}

export interface FunctionDeclarationFilterCriterionParameters
  extends CriterionBase<Criterion> {
  minNumberOfFunctionDeclarations: number;
  maxNumberOfFunctionDeclarations: number;
}

const toAnalysisInput = (
  _criterion: FunctionDeclarationFilterCriterion,
): CriteriaToAnalyzeInput<Criterion> => ({
  criterion,
  input: undefined,
});

export const FunctionDeclarationCriterionAxis: CriterionAxisDefinition<Criterion> =
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
      const numberOfFunctionDeclarations = analyzeAst(analysis.generalAst, {
        criterion,
        input: undefined,
      }).output;

      return numberOfFunctionDeclarations;
    },
  };

export const FunctionDeclarationCriterionFilter: CriterionFilterDefinition<
  Criterion,
  FunctionDeclarationFilterCriterion,
  FunctionDeclarationFilterCriterionParameters
> = {
  criterion,
  formComponent: FunctionDeclarationCriterionFilterForm,
  messages: () => messages,
  initialValues: {
    criterion,
    minimumCount: 0,
    maximumCount: 100,
  },
  run: (config, analyses) => {
    const numberOfFunctionDeclarationsList = analyses.map(
      (analysis) =>
        analyzeAst(analysis.generalAst, toAnalysisInput(config)).output,
    );

    return {
      matchesFilter: numberOfFunctionDeclarationsList.map(
        (numberOfFunctionDeclarations) =>
          config.minimumCount <= numberOfFunctionDeclarations &&
          config.maximumCount >= numberOfFunctionDeclarations,
      ),
      parameters: {
        criterion,
        maxNumberOfFunctionDeclarations: Math.max(
          ...numberOfFunctionDeclarationsList,
        ),
        minNumberOfFunctionDeclarations: Math.min(
          ...numberOfFunctionDeclarationsList,
        ),
      },
    };
  },
};
