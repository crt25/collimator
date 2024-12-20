import { defineMessages } from "react-intl";
import {
  CriterionAxisDefinition,
  CriterionBase,
  CriterionFilterDefinition,
} from "../criterion-base";
import AstHeightCriterionFilterForm from "./AstHeightCriterionFilterForm";
import {
  analyzeAst,
  CriteriaToAnalyzeInput,
  AstCriterionType,
} from "@/data-analyzer/analyze-asts";

type Criterion = AstCriterionType.height;

const messages = defineMessages({
  name: {
    id: "criteria.astHeight.name",
    defaultMessage: "Nestedness (AST Tree Height)",
  },
});

export interface AstHeightFilterCriterion extends CriterionBase<Criterion> {
  minimumCount: number;
  maximumCount: number;
}

const toAnalysisInput = (
  _criterion: AstHeightFilterCriterion,
): CriteriaToAnalyzeInput<AstCriterionType.height> => ({
  criterion: AstCriterionType.height,
  input: undefined,
});

export const AstHeightCriterionAxis: CriterionAxisDefinition<Criterion> = {
  criterion: AstCriterionType.height,
  messages: () => messages,
  config: {
    type: "linear",
    ticks: {
      precision: 0,
    },
  },
  getAxisValue: (analysis) =>
    analyzeAst(analysis.generalAst, {
      criterion: AstCriterionType.height,
      input: undefined,
    }).output,
};

export const AstHeightCriterionFilter: CriterionFilterDefinition<
  Criterion,
  AstHeightFilterCriterion
> = {
  criterion: AstCriterionType.height,
  formComponent: AstHeightCriterionFilterForm,
  messages: () => messages,
  initialValues: {
    criterion: AstCriterionType.height,
    minimumCount: 0,
    maximumCount: 100,
  },
  matchesFilter: (config, analysis) => {
    const height = analyzeAst(
      analysis.generalAst,
      toAnalysisInput(config),
    ).output;

    return config.minimumCount <= height && config.maximumCount >= height;
  },
};
