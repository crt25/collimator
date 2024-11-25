import { defineMessages } from "react-intl";
import {
  CriterionBase,
  CriterionFilterDefinition,
  CriterionGroupDefinition,
} from "../criterion-base";
import NoneCriterionForm from "./NoneCriterionForm";
import {
  CriteriaToAnalyzeInput,
  CriterionType,
} from "@/data-analyzer/analyze-asts";

type Criterion = CriterionType.none;

const messages = defineMessages({
  filterName: {
    id: "criteria.none.filterName",
    defaultMessage: "Select a new filter",
  },
  groupName: {
    id: "criteria.none.groupName",
    defaultMessage: "Select a new grouping criterion",
  },
});

export type NoneCriterion = CriterionBase<Criterion>;

const toAnalysisInput = (): CriteriaToAnalyzeInput<CriterionType.none> => ({
  criterion: CriterionType.none,
  input: undefined,
});

export const NoCriterionFilter: CriterionFilterDefinition<
  Criterion,
  NoneCriterion
> = {
  criterion: CriterionType.none,
  formComponent: NoneCriterionForm,
  messages: () => ({
    name: messages.filterName,
  }),
  toAnalysisInput,
  matchesFilter: () => false,
};

export const NoCriterionGroup: CriterionGroupDefinition<
  Criterion,
  NoneCriterion
> = {
  criterion: CriterionType.none,
  formComponent: NoneCriterionForm,
  messages: () => ({
    name: messages.groupName,
  }),
  toAnalysisInput,
  getGroup: () => "",
};
