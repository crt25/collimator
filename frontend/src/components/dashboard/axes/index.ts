import { AstCriterionType } from "@/data-analyzer/analyze-asts";
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
    .with(AstCriterionType.statement, () =>
      StatementCriterionAxis.getAxisValue(analysis),
    )
    .with(AstCriterionType.expression, () =>
      ExpressionCriterionAxis.getAxisValue(analysis),
    )
    .with(AstCriterionType.condition, () =>
      ConditionCriterionAxis.getAxisValue(analysis),
    )
    .with(AstCriterionType.loop, () => LoopCriterionAxis.getAxisValue(analysis))
    .with(AstCriterionType.functionCall, () =>
      FunctionCallCriterionAxis.getAxisValue(analysis),
    )
    .with(AstCriterionType.functionDeclaration, () =>
      FunctionDeclarationCriterionAxis.getAxisValue(analysis),
    )
    .otherwise(() => {
      throw new Error("AST axis does not match output");
    });

export const getAxisConfig = (axisType: AxesCriterionType): AxisConfig =>
  match(axisType)
    .with(AstCriterionType.statement, () => StatementCriterionAxis.config)
    .with(AstCriterionType.expression, () => ExpressionCriterionAxis.config)
    .with(AstCriterionType.condition, () => ConditionCriterionAxis.config)
    .with(AstCriterionType.loop, () => LoopCriterionAxis.config)
    .with(AstCriterionType.functionCall, () => FunctionCallCriterionAxis.config)
    .with(
      AstCriterionType.functionDeclaration,
      () => FunctionDeclarationCriterionAxis.config,
    )
    .exhaustive();
