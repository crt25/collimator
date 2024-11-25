import { NoCriterionFilter } from "../criteria/none";
import { ConditionCriterionFilter } from "../criteria/condition";
import { DefinitionCriterion } from "../criteria/criterion-base";
import { FunctionCallCriterionFilter } from "../criteria/function-call";
import { StatementCriterionFilter } from "../criteria/statement";
import { ExpressionCriterionFilter } from "../criteria/expression";
import { LoopCriterionFilter } from "../criteria/loop";
import { FunctionDeclarationCriterionFilter } from "../criteria/function-declaration";

export const filterCriteria = [
  NoCriterionFilter,
  StatementCriterionFilter,
  ExpressionCriterionFilter,
  ConditionCriterionFilter,
  LoopCriterionFilter,
  FunctionCallCriterionFilter,
  FunctionDeclarationCriterionFilter,
];

type FilterCriterionDefinition = (typeof filterCriteria)[number];
type FilterCriterion = DefinitionCriterion<FilterCriterionDefinition>;

export type FilterCriterionType = FilterCriterionDefinition["criterion"];

export type AstFilter = FilterCriterion;

export type FilterDefinitionByCriterion = {
  [key in FilterCriterionType]: FilterCriterionDefinition & {
    criterion: key;
  };
};
