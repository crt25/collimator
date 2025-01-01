import { defineMessages } from "react-intl";
import { CriterionBase, CriterionFilterDefinition } from "../criterion-base";
import NoneCriterionForm from "./NoneCriterionForm";
import { MetaCriterionType } from "../meta-criterion-type";

const criterion = MetaCriterionType.none;
type Criterion = typeof criterion;

const messages = defineMessages({
  filterName: {
    id: "criteria.none.filterName",
    defaultMessage: "Add a new filter",
  },
});

export type NoneCriterion = CriterionBase<Criterion>;
export type NoneCriterionParameters = CriterionBase<Criterion>;

export const NoCriterionFilter: CriterionFilterDefinition<
  Criterion,
  NoneCriterion,
  NoneCriterionParameters
> = {
  criterion,
  formComponent: NoneCriterionForm,
  messages: () => ({
    name: messages.filterName,
  }),
  initialValues: {
    criterion,
  },
  run: (_, analyses) => ({
    matchesFilter: analyses.map(() => false),
    parameters: {
      criterion,
    },
  }),
};
