import { defineMessages } from "react-intl";
import { CriterionBase, CriterionFilterDefinition } from "../criterion-base";
import NoneCriterionForm from "./NoneCriterionForm";
import { MetaCriterionType } from "../meta-criterion-type";

type Criterion = MetaCriterionType.none;

const messages = defineMessages({
  filterName: {
    id: "criteria.none.filterName",
    defaultMessage: "Add a new filter",
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
  initialValues: {
    criterion: MetaCriterionType.none,
  },
  matchesFilter: () => false,
};
