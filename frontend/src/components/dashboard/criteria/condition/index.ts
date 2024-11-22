import { defineMessages } from "react-intl";
import { CriterionBase, CriterionDefinition } from "../criterion-base";
import { CriteronType } from "../criterion-type";
import ConditionCriterionFilterForm from "./ConditionCriterionFilterForm";
import ConditionCriterionGroupForm from "./ConditionCriterionGroupForm";

type Criterion = CriteronType.condition;

const messages = defineMessages({
  name: {
    id: "criteria.condition.name",
    defaultMessage: "If",
  },
});

export interface ConditionFilterCriterion extends CriterionBase<Criterion> {
  minimumCount: number;
  maximumCount: number;
}

export interface ConditionGroupCriterion extends CriterionBase<Criterion> {
  granularity: number;
}

export const conditionCriterionFilter: CriterionDefinition<
  Criterion,
  ConditionFilterCriterion
> = {
  criterion: CriteronType.condition,
  formComponent: ConditionCriterionFilterForm,
  messages,
};

export const conditionCriterionGroup: CriterionDefinition<
  Criterion,
  ConditionGroupCriterion
> = {
  criterion: CriteronType.condition,
  formComponent: ConditionCriterionGroupForm,
  messages,
};
