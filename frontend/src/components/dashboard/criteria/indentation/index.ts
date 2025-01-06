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
import IndentationCriterionFilterForm from "./IndentationCriterionFilterForm";

const criterion = AstCriterionType.indentation;
type Criterion = typeof criterion;

const messages = defineMessages({
  name: {
    id: "criteria.indentation.name",
    defaultMessage: "Code Indentation",
  },
});

export interface IndentationFilterCriterion extends CriterionBase<Criterion> {
  minimumIndentation: number;
  maximumIndentation: number;
}

export interface IndentationFilterCriterionParameters
  extends CriterionBase<Criterion> {
  minimumIndentation: number;
  maximumIndentation: number;
}

const toAnalysisInput = (
  _criterion: IndentationFilterCriterion,
): CriteriaToAnalyzeInput<Criterion> => ({
  criterion,
  input: undefined,
});

export const IndentationCriterionAxis: CriterionAxisDefinition<Criterion> = {
  criterion,
  messages: () => messages,
  config: {
    type: "linear",
    ticks: {
      precision: 0,
    },
  },
  getAxisValue: (analysis) =>
    analyzeAst(analysis.generalAst, {
      criterion,
      input: undefined,
    }).output,
};

export const IndentationCriterionFilter: CriterionFilterDefinition<
  Criterion,
  IndentationFilterCriterion,
  IndentationFilterCriterionParameters
> = {
  criterion,
  formComponent: IndentationCriterionFilterForm,
  messages: () => messages,
  initialValues: {
    criterion,
    minimumIndentation: 0,
    maximumIndentation: 100,
  },
  run: (config, analyses) => {
    const heights = analyses.map(
      (analysis) =>
        analyzeAst(analysis.generalAst, toAnalysisInput(config)).output,
    );

    return {
      matchesFilter: heights.map(
        (height) =>
          config.minimumIndentation <= height &&
          config.maximumIndentation >= height,
      ),
      parameters: {
        criterion,
        minimumIndentation: Math.min(...heights),
        maximumIndentation: Math.max(...heights),
      },
    };
  },
};
