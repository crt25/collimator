import { defineMessages } from "react-intl";
import {
  CriterionAxisDefinition,
  CriterionBase,
  CriterionFilterDefinition,
} from "../criterion-base";
import {
  analyzeAst,
  CriteriaToAnalyzeInput,
  AstCriterionType,
} from "@/data-analyzer/analyze-asts";
import LoopCriterionFilterForm from "./LoopCriterionFilterForm";

type Criterion = AstCriterionType.loop;

const messages = defineMessages({
  name: {
    id: "criteria.loop.name",
    defaultMessage: "Loop",
  },
});

export interface LoopFilterCriterion extends CriterionBase<Criterion> {
  minimumCount: number;
  maximumCount: number;
}

const toAnalysisInput = (
  _criterion: LoopFilterCriterion,
): CriteriaToAnalyzeInput<AstCriterionType.loop> => ({
  criterion: AstCriterionType.loop,
  input: undefined,
});

export const LoopCriterionAxis: CriterionAxisDefinition<Criterion> = {
  criterion: AstCriterionType.loop,
  messages: () => messages,
  config: {
    type: "linear",
    ticks: {
      precision: 0,
    },
  },
  getAxisValue: (analysis) => {
    const numberOfLoops = analyzeAst(analysis.generalAst, {
      criterion: AstCriterionType.loop,
      input: undefined,
    }).output;

    return numberOfLoops;
  },
};

export const LoopCriterionFilter: CriterionFilterDefinition<
  Criterion,
  LoopFilterCriterion
> = {
  criterion: AstCriterionType.loop,
  formComponent: LoopCriterionFilterForm,
  messages: () => messages,
  initialValues: {
    criterion: AstCriterionType.loop,
    minimumCount: 0,
    maximumCount: 100,
  },
  matchesFilter: (config, analysis) => {
    const numberOfLoops = analyzeAst(
      analysis.generalAst,
      toAnalysisInput(config),
    ).output;

    return (
      config.minimumCount <= numberOfLoops &&
      config.maximumCount >= numberOfLoops
    );
  },
};
