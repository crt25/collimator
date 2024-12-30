import { AstCriterionType } from "@/data-analyzer/analyze-asts";
import { ConditionCriterionAxis } from "../criteria/condition";
import {
  AxisConfig,
  CriterionAxisDefinition,
  DefinitionCriterion,
} from "../criteria/criterion-base";
import { ExpressionCriterionAxis } from "../criteria/expression";
import { BuiltInFunctionCallCriterionAxis } from "../criteria/built-in-function-call";
import { FunctionDeclarationCriterionAxis } from "../criteria/function-declaration";
import { LoopCriterionAxis } from "../criteria/loop";
import { StatementCriterionAxis } from "../criteria/statement";
import { match } from "ts-pattern";
import { CurrentAnalysis } from "@/api/collimator/models/solutions/current-analysis";
import { TestCriterionAxis } from "../criteria/test";
import { MetaCriterionType } from "../criteria/meta-criterion-type";
import { CriterionType } from "../criteria/criterion-type";
import { AstHeightCriterionAxis } from "../criteria/ast-height";
import { IndentationCriterionAxis } from "../criteria/indentation";
import { CustomFunctionCallCriterionAxis } from "../criteria/custom-function-call";

export const axisCriteria = [
  ConditionCriterionAxis,
  ExpressionCriterionAxis,
  CustomFunctionCallCriterionAxis,
  BuiltInFunctionCallCriterionAxis,
  FunctionDeclarationCriterionAxis,
  TestCriterionAxis,
  LoopCriterionAxis,
  StatementCriterionAxis,
  IndentationCriterionAxis,
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
    .with(AstCriterionType.condition, () => ConditionCriterionAxis)
    .with(
      AstCriterionType.customFunctionCall,
      () => CustomFunctionCallCriterionAxis,
    )
    .with(AstCriterionType.expression, () => ExpressionCriterionAxis)
    .with(AstCriterionType.builtInFunctionCall, () => BuiltInFunctionCallCriterionAxis)
    .with(
      AstCriterionType.functionDeclaration,
      () => FunctionDeclarationCriterionAxis,
    )
    .with(AstCriterionType.height, () => AstHeightCriterionAxis)
    .with(AstCriterionType.indentation, () => IndentationCriterionAxis)
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
