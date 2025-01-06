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
import AstHeightCriterionFilterForm from "./AstHeightCriterionFilterForm";

const criterion = AstCriterionType.height;
type Criterion = typeof criterion;

const messages = defineMessages({
  name: {
    id: "criteria.astHeight.name",
    defaultMessage: "Nestedness (AST Tree Height)",
  },
});

export interface AstHeightFilterCriterion extends CriterionBase<Criterion> {
  minimumHeight: number;
  maximumHeight: number;
}

export interface AstHeightFilterCriterionParameters
  extends CriterionBase<Criterion> {
  minimumAstHeight: number;
  maximumAstHeight: number;
}

const toAnalysisInput = (
  _criterion: AstHeightFilterCriterion,
): CriteriaToAnalyzeInput<Criterion> => ({
  criterion,
  input: undefined,
});

export const AstHeightCriterionAxis: CriterionAxisDefinition<Criterion> = {
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

export const AstHeightCriterionFilter: CriterionFilterDefinition<
  Criterion,
  AstHeightFilterCriterion,
  AstHeightFilterCriterionParameters
> = {
  criterion,
  formComponent: AstHeightCriterionFilterForm,
  messages: () => messages,
  initialValues: {
    criterion,
    minimumHeight: 0,
    maximumHeight: 100,
  },
  run: (config, analyses) => {
    const heights = analyses.map(
      (analysis) =>
        analyzeAst(analysis.generalAst, toAnalysisInput(config)).output,
    );

    return {
      matchesFilter: heights.map(
        (height) =>
          config.minimumHeight <= height && config.maximumHeight >= height,
      ),
      parameters: {
        criterion,
        minimumAstHeight: Math.min(...heights),
        maximumAstHeight: Math.max(...heights),
      },
    };
  },
};
