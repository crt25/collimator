import { defineMessages } from "react-intl";
import { CriterionBase, CriterionFilterDefinition } from "../criterion-base";
import NoneCriterionForm from "./NoneCriterionForm";
import { MetaCriterionType } from "../meta-criterion-type";

type Criterion = MetaCriterionType.none;

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

export const NoCriterionFilter: CriterionFilterDefinition<
  Criterion,
  NoneCriterion
> = {
  criterion: MetaCriterionType.none,
  formComponent: NoneCriterionForm,
  messages: () => ({
    name: messages.filterName,
  }),
  matchesFilter: () => false,
};
