import { TaskType } from "@/api/collimator/generated/models";
import { CurrentAnalysis } from "@/api/collimator/models/solutions/current-analysis";
import { AstCriterionType } from "@/data-analyzer/analyze-asts";
import { ChartTypeRegistry, ScaleOptionsByType } from "chart.js";
import { MessageDescriptor } from "react-intl";

export interface CriterionBase<Type extends AstCriterionType> {
  criterion: Type;
}

export type CriterionFormProps<
  Type extends AstCriterionType,
  Criterion extends CriterionBase<Type>,
> = {
  submitMessage: MessageDescriptor;
  initialValues: Partial<Omit<Criterion, "criterion">>;
  onUpdate: (criteron: Criterion) => void;
};

export type CriterionFormComponent<
  Type extends AstCriterionType,
  Criterion extends CriterionBase<Type>,
> = React.FunctionComponent<CriterionFormProps<Type, Criterion>>;

export type AxisConfig = Partial<
  ScaleOptionsByType<ChartTypeRegistry["bubble"]["scales"]>
>;

export interface CriterionAxisDefinition<Type extends AstCriterionType> {
  criterion: Type;
  messages: (taskType: TaskType) => {
    name: MessageDescriptor;
  };
  config: AxisConfig;
  getAxisValue: (analysis: CurrentAnalysis) => number;
}

interface CriterionDefinition<
  Type extends AstCriterionType,
  Criterion extends CriterionBase<Type>,
> {
  criterion: Type;
  formComponent: CriterionFormComponent<Type, Criterion>;
  messages: (taskType: TaskType) => {
    name: MessageDescriptor;
  };
}

export interface CriterionFilterDefinition<
  Type extends AstCriterionType,
  Criterion extends CriterionBase<Type>,
> extends CriterionDefinition<Type, Criterion> {
  matchesFilter: (criterion: Criterion, analysis: CurrentAnalysis) => boolean;
}

export type DefinitionCriterion<T> =
  T extends CriterionDefinition<infer _Type, infer Criterion>
    ? Criterion
    : never;

export type DefinitionCriterionType<T> =
  T extends CriterionFormComponent<infer Type, infer _Criterion> ? Type : never;
