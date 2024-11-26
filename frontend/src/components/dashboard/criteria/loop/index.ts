import { defineMessages } from "react-intl";
import {
  CriterionAxisDefinition,
  CriterionBase,
  CriterionFilterDefinition,
  CriterionGroupDefinition,
} from "../criterion-base";
import {
  analyzeAst,
  CriteriaToAnalyzeInput,
  CriterionType,
} from "@/data-analyzer/analyze-asts";
import LoopCriterionFilterForm from "./LoopCriterionFilterForm";
import LoopCriterionGroupForm from "./LoopCriterionGroupForm";

type Criterion = CriterionType.loop;

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

export interface LoopGroupCriterion extends CriterionBase<Criterion> {
  granularity: number;
}

const toAnalysisInput = (
  _criterion: LoopFilterCriterion | LoopGroupCriterion,
): CriteriaToAnalyzeInput<CriterionType.loop> => ({
  criterion: CriterionType.loop,
  input: undefined,
});

export const LoopCriterionAxis: CriterionAxisDefinition<Criterion> = {
  criterion: CriterionType.loop,
  messages: () => messages,
  config: {
    type: "linear",
    min: 0,
  },
  getAxisValue: (analysis) => {
    const numberOfLoops = analyzeAst(analysis.generalAst, {
      criterion: CriterionType.loop,
      input: undefined,
    }).output;

    return numberOfLoops;
  },
};

export const LoopCriterionFilter: CriterionFilterDefinition<
  Criterion,
  LoopFilterCriterion
> = {
  criterion: CriterionType.loop,
  formComponent: LoopCriterionFilterForm,
  messages: () => messages,
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

export const LoopCriterionGroup: CriterionGroupDefinition<
  Criterion,
  LoopGroupCriterion
> = {
  criterion: CriterionType.loop,
  formComponent: LoopCriterionGroupForm,
  messages: () => messages,
  getGroup: (config, analysis) => {
    const numberOfLoops = analyzeAst(
      analysis.generalAst,
      toAnalysisInput(config),
    ).output;

    return Math.round(numberOfLoops / config.granularity).toString();
  },
};
