import { defineMessages } from "react-intl";
import { CriteronType } from "../criterion-type";
import { CriterionBase, CriterionDefinition } from "../criterion-base";
import NoneCriterionForm from "./NoneCriterionForm";

type Criterion = CriteronType.none;

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

export const noCriteriaFilter: CriterionDefinition<Criterion, NoneCriterion> = {
  criterion: CriteronType.none,
  formComponent: NoneCriterionForm,
  messages: {
    name: messages.filterName,
  },
};

export const noCriteriaGroup: CriterionDefinition<Criterion, NoneCriterion> = {
  criterion: CriteronType.none,
  formComponent: NoneCriterionForm,
  messages: {
    name: messages.groupName,
  },
};
