import { ConditionCriterionAxis } from "../criteria/condition";
import { DefinitionCriterion } from "../criteria/criterion-base";
import { ExpressionCriterionAxis } from "../criteria/expression";
import { FunctionCallCriterionAxis } from "../criteria/function-call";
import { FunctionDeclarationCriterionAxis } from "../criteria/function-declaration";
import { LoopCriterionAxis } from "../criteria/loop";
import { StatementCriterionAxis } from "../criteria/statement";

export const axisCriteria = [
  StatementCriterionAxis,
  ExpressionCriterionAxis,
  ConditionCriterionAxis,
  LoopCriterionAxis,
  FunctionCallCriterionAxis,
  FunctionDeclarationCriterionAxis,
];

type AxesCriterionDefinition = (typeof axisCriteria)[number];
type AxesCriterion = DefinitionCriterion<AxesCriterionDefinition>;

export type AxesCriterionType = AxesCriterionDefinition["criterion"];

export type AstAxis = AxesCriterion;

export type AxisDefinitionByCriterion = {
  [key in AxesCriterionType]: AxesCriterionDefinition & {
    criterion: key;
  };
};
