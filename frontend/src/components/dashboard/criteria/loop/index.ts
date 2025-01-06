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
import LoopCriterionFilterForm from "./LoopCriterionFilterForm";

const criterion = AstCriterionType.loop;
type Criterion = typeof criterion;

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

export interface LoopFilterCriterionParameters
  extends CriterionBase<Criterion> {
  minNumberOfLoops: number;
  maxNumberOfLoops: number;
}

const toAnalysisInput = (
  _criterion: LoopFilterCriterion,
): CriteriaToAnalyzeInput<Criterion> => ({
  criterion,
  input: undefined,
});

export const LoopCriterionAxis: CriterionAxisDefinition<Criterion> = {
  criterion,
  messages: () => messages,
  config: {
    type: "linear",
    ticks: {
      precision: 0,
    },
  },
  getAxisValue: (analysis) => {
    const numberOfLoops = analyzeAst(analysis.generalAst, {
      criterion,
      input: undefined,
    }).output;

    return numberOfLoops;
  },
};

export const LoopCriterionFilter: CriterionFilterDefinition<
  Criterion,
  LoopFilterCriterion,
  LoopFilterCriterionParameters
> = {
  criterion,
  formComponent: LoopCriterionFilterForm,
  messages: () => messages,
  initialValues: {
    criterion,
    minimumCount: 0,
    maximumCount: 100,
  },
  run: (config, analyses) => {
    const numberOfLoopsList = analyses.map(
      (analysis) =>
        analyzeAst(analysis.generalAst, toAnalysisInput(config)).output,
    );

    return {
      matchesFilter: numberOfLoopsList.map(
        (numberOfLoops) =>
          config.minimumCount <= numberOfLoops &&
          config.maximumCount >= numberOfLoops,
      ),
      parameters: {
        criterion,
        maxNumberOfLoops: Math.max(...numberOfLoopsList),
        minNumberOfLoops: Math.min(...numberOfLoopsList),
      },
    };
  },
};
