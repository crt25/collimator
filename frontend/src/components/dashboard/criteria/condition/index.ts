import { defineMessages } from "react-intl";
import { CriterionBase, CriterionDefinition } from "../criterion-base";
import ConditionCriterionFilterForm from "./ConditionCriterionFilterForm";
import ConditionCriterionGroupForm from "./ConditionCriterionGroupForm";
import { CriterionType } from "@/data-analyzer/analyze-asts";

type Criterion = CriterionType.condition;

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
  criterion: CriterionType.condition,
  formComponent: ConditionCriterionFilterForm,
  messages,
};

export const conditionCriterionGroup: CriterionDefinition<
  Criterion,
  ConditionGroupCriterion
> = {
  criterion: CriterionType.condition,
  formComponent: ConditionCriterionGroupForm,
  messages,
};
