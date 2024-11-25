import { NoCriterionGroup } from "../criteria/none";
import { ConditionCriterionGroup } from "../criteria/condition";
import { DefinitionCriterion } from "../criteria/criterion-base";
import { FunctionCallCriterionGroup } from "../criteria/function-call";
import { StatementCriterionGroup } from "../criteria/statement";
import { ExpressionCriterionGroup } from "../criteria/expression";
import { LoopCriterionGroup } from "../criteria/loop";
import { FunctionDeclarationCriterionGroup } from "../criteria/function-declaration";

export const groupCriteria = [
  NoCriterionGroup,
  StatementCriterionGroup,
  ExpressionCriterionGroup,
  ConditionCriterionGroup,
  LoopCriterionGroup,
  FunctionCallCriterionGroup,
  FunctionDeclarationCriterionGroup,
];

type GroupCriterionDefinition = (typeof groupCriteria)[number];
type GroupCriterion = DefinitionCriterion<GroupCriterionDefinition>;

export type GroupCriterionType = GroupCriterionDefinition["criterion"];

export type AstGroup = GroupCriterion;

export type GroupDefinitionByCriterion = {
  [key in GroupCriterionType]: GroupCriterionDefinition & {
    criterion: key;
  };
};
