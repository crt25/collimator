import { defineMessages } from "react-intl";
import {
  CriterionAxisDefinition,
  CriterionBase,
  CriterionFilterDefinition,
} from "../criterion-base";
import {
  analyzeAst,
  CriteriaToAnalyzeInput,
  CriterionType,
} from "@/data-analyzer/analyze-asts";
import FunctionDeclarationCriterionFilterForm from "./FunctionDeclarationCriterionFilterForm";

type Criterion = CriterionType.functionDeclaration;

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

const toAnalysisInput = (
  _criterion: FunctionDeclarationFilterCriterion,
): CriteriaToAnalyzeInput<CriterionType.functionDeclaration> => ({
  criterion: CriterionType.functionDeclaration,
  input: undefined,
});

export const FunctionDeclarationCriterionAxis: CriterionAxisDefinition<Criterion> =
  {
    criterion: CriterionType.functionDeclaration,
    messages: () => messages,
    config: {
      type: "linear",
      min: 0,
    },
    getAxisValue: (analysis) => {
      const numberOfFunctionDeclarations = analyzeAst(analysis.generalAst, {
        criterion: CriterionType.functionDeclaration,
        input: undefined,
      }).output;

      return numberOfFunctionDeclarations;
    },
  };

export const FunctionDeclarationCriterionFilter: CriterionFilterDefinition<
  Criterion,
  FunctionDeclarationFilterCriterion
> = {
  criterion: CriterionType.functionDeclaration,
  formComponent: FunctionDeclarationCriterionFilterForm,
  messages: () => messages,
  matchesFilter: (config, analysis) => {
    const numberOfFunctionDeclarations = analyzeAst(
      analysis.generalAst,
      toAnalysisInput(config),
    ).output;

    return (
      config.minimumCount <= numberOfFunctionDeclarations &&
      config.maximumCount >= numberOfFunctionDeclarations
    );
  },
};
