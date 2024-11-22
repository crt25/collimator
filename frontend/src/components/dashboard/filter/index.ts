import { MessageDescriptor } from "react-intl";
import { noCriteriaFilter } from "../criteria/none";
import { conditionCriterionFilter } from "../criteria/condition";
import { DefinitionCriterion } from "../criteria/criterion-base";

const filterCriteria = [noCriteriaFilter, conditionCriterionFilter];

type FilterCriterionDefinition = (typeof filterCriteria)[number];
type FilterCriterion = DefinitionCriterion<FilterCriterionDefinition>;

export type FilterCriterionType = FilterCriterionDefinition["criterion"];

export type AstFilter = FilterCriterion;

export const filterNameByCriterion = filterCriteria.reduce(
  (acc, criterion) => {
    acc[criterion.criterion] = criterion.messages.name;
    return acc;
  },
  {} as {
    [key in FilterCriterionType]: MessageDescriptor;
  },
);

type DefinitionByCriterion = {
  [key in FilterCriterionType]: FilterCriterionDefinition & {
    criterion: key;
  };
};

export type FilterFormByCriterion = {
  [key in FilterCriterionType]: DefinitionByCriterion[key]["formComponent"];
};

export const filterFormComponentByCriterion = filterCriteria.reduce(
  (acc, definition) => {
    // @ts-expect-error - Typescript cannot infer that this is a valid assignment
    acc[definition.criterion] = definition.formComponent;
    return acc;
  },
  {} as {
    [key in FilterCriterionType]: DefinitionByCriterion[key]["formComponent"];
  },
);

export const allFilters = filterCriteria.map((c) => ({
  value: c.criterion,
  label: c.messages.name,
}));
