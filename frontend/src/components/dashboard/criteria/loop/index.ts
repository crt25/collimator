import { defineMessages } from "react-intl";
import {
  CriterionAxisDefinition,
  CriterionBase,
  CriterionFilterDefinition,
  CriterionGroupDefinition,
} from "../criterion-base";
import {
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
  analysisInput: {
    criterion: CriterionType.loop,
    input: undefined,
  },
  config: {
    type: "linear",
    min: 0,
  },
  getAxisValue: (numberOfLoops) => numberOfLoops,
};

export const LoopCriterionFilter: CriterionFilterDefinition<
  Criterion,
  LoopFilterCriterion
> = {
  criterion: CriterionType.loop,
  formComponent: LoopCriterionFilterForm,
  messages: () => messages,
  toAnalysisInput,
  matchesFilter: (config, numberOfLoops) =>
    config.minimumCount <= numberOfLoops &&
    config.maximumCount >= numberOfLoops,
};

export const LoopCriterionGroup: CriterionGroupDefinition<
  Criterion,
  LoopGroupCriterion
> = {
  criterion: CriterionType.loop,
  formComponent: LoopCriterionGroupForm,
  messages: () => messages,
  toAnalysisInput,
  getGroup: (config, numberOfLoops) =>
    Math.round(numberOfLoops / config.granularity).toString(),
};
