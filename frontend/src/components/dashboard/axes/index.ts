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
import { AstHeightCriterionAxis } from "../criteria/ast-height";

export const axisCriteria = [
  ConditionCriterionAxis,
  ExpressionCriterionAxis,
  FunctionCallCriterionAxis,
  FunctionDeclarationCriterionAxis,
  TestCriterionAxis,
  LoopCriterionAxis,
  StatementCriterionAxis,
  AstHeightCriterionAxis,
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
    .with(AstCriterionType.expression, () => ExpressionCriterionAxis)
    .with(AstCriterionType.condition, () => ConditionCriterionAxis)
    .with(AstCriterionType.functionCall, () => FunctionCallCriterionAxis)
    .with(
      AstCriterionType.functionDeclaration,
      () => FunctionDeclarationCriterionAxis,
    )
    .with(AstCriterionType.height, () => AstHeightCriterionAxis)
    .with(AstCriterionType.loop, () => LoopCriterionAxis)
    .with(AstCriterionType.statement, () => StatementCriterionAxis)
    .with(MetaCriterionType.test, () => TestCriterionAxis)
    .exhaustive();

export const getAxisAnalysisValue = (
  axisType: AxesCriterionType,
  analysis: CurrentAnalysis,
): number => getAxisDefinition(axisType).getAxisValue(analysis);

export const getAxisConfig = (axisType: AxesCriterionType): AxisConfig =>
  getAxisDefinition(axisType).config;
