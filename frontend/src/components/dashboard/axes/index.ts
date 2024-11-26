import { CriterionType } from "@/data-analyzer/analyze-asts";
import { ConditionCriterionAxis } from "../criteria/condition";
import { AxisConfig, DefinitionCriterion } from "../criteria/criterion-base";
import { ExpressionCriterionAxis } from "../criteria/expression";
import { FunctionCallCriterionAxis } from "../criteria/function-call";
import { FunctionDeclarationCriterionAxis } from "../criteria/function-declaration";
import { LoopCriterionAxis } from "../criteria/loop";
import { StatementCriterionAxis } from "../criteria/statement";
import { match } from "ts-pattern";
import { CurrentAnalysis } from "@/api/collimator/models/solutions/current-analysis";

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

export const getAxisAnalysisValue = (
  axisType: AxesCriterionType,
  analysis: CurrentAnalysis,
): number =>
  match(axisType)
    .returnType<number>()
    .with(CriterionType.statement, () =>
      StatementCriterionAxis.getAxisValue(analysis),
    )
    .with(CriterionType.expression, () =>
      ExpressionCriterionAxis.getAxisValue(analysis),
    )
    .with(CriterionType.condition, () =>
      ConditionCriterionAxis.getAxisValue(analysis),
    )
    .with(CriterionType.loop, () => LoopCriterionAxis.getAxisValue(analysis))
    .with(CriterionType.functionCall, () =>
      FunctionCallCriterionAxis.getAxisValue(analysis),
    )
    .with(CriterionType.functionDeclaration, () =>
      FunctionDeclarationCriterionAxis.getAxisValue(analysis),
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
