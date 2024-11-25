import { NoCriterionGroup } from "../criteria/none";
import { ConditionCriterionGroup } from "../criteria/condition";
import { DefinitionCriterion } from "../criteria/criterion-base";
import { FunctionCallCriterionGroup } from "../criteria/function-call";
import { StatementCriterionGroup } from "../criteria/statement";
import { ExpressionCriterionGroup } from "../criteria/expression";
import { LoopCriterionGroup } from "../criteria/loop";
import { FunctionDeclarationCriterionGroup } from "../criteria/function-declaration";
import {
  AnalysisInput,
  AnalysisOutput,
  CriterionType,
} from "@/data-analyzer/analyze-asts";
import { match } from "ts-pattern";

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

export const groupToAnalysisInput = (group: AstGroup): AnalysisInput =>
  match(group)
    .returnType<AnalysisInput>()
    .with({ criterion: CriterionType.none }, () => {
      throw new Error("Cannot convert 'no criterion' group to analysis input");
    })
    .with(
      { criterion: CriterionType.statement },
      StatementCriterionGroup.toAnalysisInput,
    )
    .with(
      { criterion: CriterionType.expression },
      ExpressionCriterionGroup.toAnalysisInput,
    )
    .with(
      { criterion: CriterionType.condition },
      ConditionCriterionGroup.toAnalysisInput,
    )
    .with({ criterion: CriterionType.loop }, LoopCriterionGroup.toAnalysisInput)
    .with(
      { criterion: CriterionType.functionCall },
      FunctionCallCriterionGroup.toAnalysisInput,
    )
    .with(
      { criterion: CriterionType.functionDeclaration },
      FunctionDeclarationCriterionGroup.toAnalysisInput,
    )
    .exhaustive();

export const getGroup = (criterion: AstGroup, output: AnalysisOutput): string =>
  match([criterion, output])
    .with(
      [
        { criterion: CriterionType.statement },
        { criterion: CriterionType.statement },
      ],
      ([criterion, output]) =>
        StatementCriterionGroup.getGroup(criterion, output.output),
    )
    .with(
      [
        { criterion: CriterionType.expression },
        { criterion: CriterionType.expression },
      ],
      ([criterion, output]) =>
        ExpressionCriterionGroup.getGroup(criterion, output.output),
    )
    .with(
      [
        { criterion: CriterionType.condition },
        { criterion: CriterionType.condition },
      ],
      ([criterion, output]) =>
        ConditionCriterionGroup.getGroup(criterion, output.output),
    )
    .with(
      [{ criterion: CriterionType.loop }, { criterion: CriterionType.loop }],
      ([criterion, output]) =>
        LoopCriterionGroup.getGroup(criterion, output.output),
    )
    .with(
      [
        { criterion: CriterionType.functionCall },
        { criterion: CriterionType.functionCall },
      ],
      ([criterion, output]) =>
        FunctionCallCriterionGroup.getGroup(criterion, output.output),
    )
    .with(
      [
        { criterion: CriterionType.functionDeclaration },
        { criterion: CriterionType.functionDeclaration },
      ],
      ([criterion, output]) =>
        FunctionDeclarationCriterionGroup.getGroup(criterion, output.output),
    )
    .otherwise(() => {
      throw new Error("AST filter does not match output");
    });
