import {
  AnalysisInput,
  AnalysisOutput,
  CriterionType,
} from "@/data-analyzer/analyze-asts";
import { ConditionCriterionAxis } from "../criteria/condition";
import { AxisConfig, DefinitionCriterion } from "../criteria/criterion-base";
import { ExpressionCriterionAxis } from "../criteria/expression";
import { FunctionCallCriterionAxis } from "../criteria/function-call";
import { FunctionDeclarationCriterionAxis } from "../criteria/function-declaration";
import { LoopCriterionAxis } from "../criteria/loop";
import { StatementCriterionAxis } from "../criteria/statement";
import { match } from "ts-pattern";

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

export const getAxisAnalysisInput = (
  axisType: AxesCriterionType,
): AnalysisInput =>
  match(axisType)
    .returnType<AnalysisInput>()
    .with(CriterionType.statement, () => StatementCriterionAxis.analysisInput)
    .with(CriterionType.expression, () => ExpressionCriterionAxis.analysisInput)
    .with(CriterionType.condition, () => ConditionCriterionAxis.analysisInput)
    .with(CriterionType.loop, () => LoopCriterionAxis.analysisInput)
    .with(
      CriterionType.functionCall,
      () => FunctionCallCriterionAxis.analysisInput,
    )
    .with(
      CriterionType.functionDeclaration,
      () => FunctionDeclarationCriterionAxis.analysisInput,
    )
    .exhaustive();

export const getAxisAnalysisValue = (
  axisType: AxesCriterionType,
  output: AnalysisOutput,
): number =>
  match([axisType, output])
    .returnType<number>()
    .with(
      [CriterionType.statement, { criterion: CriterionType.statement }],
      ([_, output]) => output.output,
    )
    .with(
      [CriterionType.expression, { criterion: CriterionType.expression }],
      ([_, output]) => output.output,
    )
    .with(
      [CriterionType.condition, { criterion: CriterionType.condition }],
      ([_, output]) => output.output,
    )
    .with(
      [CriterionType.loop, { criterion: CriterionType.loop }],
      ([_, output]) => output.output,
    )
    .with(
      [CriterionType.functionCall, { criterion: CriterionType.functionCall }],
      ([_, output]) => output.output,
    )
    .with(
      [
        CriterionType.functionDeclaration,
        { criterion: CriterionType.functionDeclaration },
      ],
      ([_, output]) => output.output,
    )
    .otherwise(() => {
      throw new Error("AST axis does not match output");
    });

export const getAxisConfig = (axisType: AxesCriterionType): AxisConfig =>
  match(axisType)
    .with(CriterionType.statement, () => StatementCriterionAxis.config)
    .with(CriterionType.expression, () => ExpressionCriterionAxis.config)
    .with(CriterionType.condition, () => ConditionCriterionAxis.config)
    .with(CriterionType.loop, () => LoopCriterionAxis.config)
    .with(CriterionType.functionCall, () => FunctionCallCriterionAxis.config)
    .with(
      CriterionType.functionDeclaration,
      () => FunctionDeclarationCriterionAxis.config,
    )
    .exhaustive();
