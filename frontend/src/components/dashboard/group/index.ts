import { NoCriterionGroup } from "../criteria/none";
import { ConditionCriterionGroup } from "../criteria/condition";
import { DefinitionCriterion } from "../criteria/criterion-base";
import { FunctionCallCriterionGroup } from "../criteria/function-call";
import { StatementCriterionGroup } from "../criteria/statement";
import { ExpressionCriterionGroup } from "../criteria/expression";
import { LoopCriterionGroup } from "../criteria/loop";
import { FunctionDeclarationCriterionGroup } from "../criteria/function-declaration";
import { CriterionType } from "@/data-analyzer/analyze-asts";
import { match } from "ts-pattern";
import { CurrentAnalysis } from "@/api/collimator/models/solutions/current-analysis";

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

export const getGroup = (
  criterion: AstGroup,
  analysis: CurrentAnalysis,
): string =>
  match(criterion)
    .with({ criterion: CriterionType.statement }, (criterion) =>
      StatementCriterionGroup.getGroup(criterion, analysis),
    )
    .with({ criterion: CriterionType.expression }, (criterion) =>
      ExpressionCriterionGroup.getGroup(criterion, analysis),
    )
    .with({ criterion: CriterionType.condition }, (criterion) =>
      ConditionCriterionGroup.getGroup(criterion, analysis),
    )
    .with({ criterion: CriterionType.loop }, (criterion) =>
      LoopCriterionGroup.getGroup(criterion, analysis),
    )
    .with({ criterion: CriterionType.functionCall }, (criterion) =>
      FunctionCallCriterionGroup.getGroup(criterion, analysis),
    )
    .with({ criterion: CriterionType.functionDeclaration }, (criterion) =>
      FunctionDeclarationCriterionGroup.getGroup(criterion, analysis),
    )
    .otherwise(() => {
      throw new Error("AST filter does not match output");
    });
