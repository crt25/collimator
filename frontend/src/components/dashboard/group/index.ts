import { MessageDescriptor } from "react-intl";
import { noCriteriaGroup } from "../criteria/none";
import { conditionCriterionGroup } from "../criteria/condition";
import { DefinitionCriterion } from "../criteria/criterion-base";

const groupCriteria = [noCriteriaGroup, conditionCriterionGroup];

type GroupCriterionDefinition = (typeof groupCriteria)[number];
type GroupCriterion = DefinitionCriterion<GroupCriterionDefinition>;

export type GroupCriterionType = GroupCriterionDefinition["criterion"];

export type AstGroup = GroupCriterion;

export const groupNameByCriterion = groupCriteria.reduce(
  (acc, criterion) => {
    acc[criterion.criterion] = criterion.messages.name;
    return acc;
  },
  {} as {
    [key in GroupCriterionType]: MessageDescriptor;
  },
);

type DefinitionByCriterion = {
  [key in GroupCriterionType]: GroupCriterionDefinition & {
    criterion: key;
  };
};

export type GroupFormByCriterion = {
  [key in GroupCriterionType]: DefinitionByCriterion[key]["formComponent"];
};

export const groupFormComponentByCriterion = groupCriteria.reduce(
  (acc, definition) => {
    // @ts-expect-error - Typescript cannot infer that this is a valid assignment
    acc[definition.criterion] = definition.formComponent;
    return acc;
  },
  {} as {
    [key in GroupCriterionType]: DefinitionByCriterion[key]["formComponent"];
  },
);

export const allGroups = groupCriteria.map((c) => ({
  value: c.criterion,
  label: c.messages.name,
}));
