import { AstCriterionType } from "@/data-analyzer/analyze-asts";
import { ConditionCriterionAxis } from "../criteria/condition";
import {
  AxisConfig,
  CriterionAxisDefinition,
  DefinitionCriterion,
} from "../criteria/criterion-base";
import { ExpressionCriterionAxis } from "../criteria/expression";
import { FunctionCallCriterionAxis } from "../criteria/function-call";
import { FunctionDeclarationCriterionAxis } from "../criteria/function-declaration";
import { LoopCriterionAxis } from "../criteria/loop";
import { StatementCriterionAxis } from "../criteria/statement";
import { match } from "ts-pattern";
import { CurrentAnalysis } from "@/api/collimator/models/solutions/current-analysis";
import { TestCriterionAxis } from "../criteria/test";
import { MetaCriterionType } from "../criteria/meta-criterion-type";
import { CriterionType } from "../criteria/criterion-type";

export const axisCriteria = [
  StatementCriterionAxis,
  ExpressionCriterionAxis,
  ConditionCriterionAxis,
  LoopCriterionAxis,
  FunctionCallCriterionAxis,
  FunctionDeclarationCriterionAxis,
  TestCriterionAxis,
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

const getAxisDefinition = (
  axisType: AxesCriterionType,
): CriterionAxisDefinition<CriterionType> =>
  match(axisType)
    .returnType<CriterionAxisDefinition<CriterionType>>()
    .with(AstCriterionType.statement, () => StatementCriterionAxis)
    .with(AstCriterionType.expression, () => ExpressionCriterionAxis)
    .with(AstCriterionType.condition, () => ConditionCriterionAxis)
    .with(AstCriterionType.loop, () => LoopCriterionAxis)
    .with(AstCriterionType.functionCall, () => FunctionCallCriterionAxis)
    .with(
      AstCriterionType.functionDeclaration,
      () => FunctionDeclarationCriterionAxis,
    )
    .with(MetaCriterionType.test, () => TestCriterionAxis)
    .exhaustive();

export const getAxisAnalysisValue = (
  axisType: AxesCriterionType,
  analysis: CurrentAnalysis,
): number => getAxisDefinition(axisType).getAxisValue(analysis);

export const getAxisConfig = (axisType: AxesCriterionType): AxisConfig =>
  getAxisDefinition(axisType).config;
