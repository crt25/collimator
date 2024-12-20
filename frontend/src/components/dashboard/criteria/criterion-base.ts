import { TaskType } from "@/api/collimator/generated/models";
import { CurrentAnalysis } from "@/api/collimator/models/solutions/current-analysis";
import { CartesianScaleTypeRegistry, ScaleOptionsByType } from "chart.js";
import { MessageDescriptor } from "react-intl";
import { CriterionType } from "./criterion-type";
import { DeepPartial } from "chart.js/dist/types/utils";

export interface CriterionBase<Type extends CriterionType> {
  criterion: Type;
}

export type CriterionFormProps<
  Type extends CriterionType,
  Criterion extends CriterionBase<Type>,
> = {
  value: Criterion;
  onChange: (criteron: Criterion) => void;
};

export type CriterionFormComponent<
  Type extends CriterionType,
  Criterion extends CriterionBase<Type>,
> = React.FunctionComponent<CriterionFormProps<Type, Criterion>>;

export type AxisConfig = DeepPartial<
  // use the scale options for cartesian scales
  ScaleOptionsByType<keyof CartesianScaleTypeRegistry>
>;

export interface CriterionAxisDefinition<Type extends CriterionType> {
  criterion: Type;
  messages: (taskType: TaskType) => {
    name: MessageDescriptor;
  };
  config: AxisConfig;
  getAxisValue: (analysis: CurrentAnalysis) => number;
}

interface CriterionDefinition<
  Type extends CriterionType,
  Criterion extends CriterionBase<Type>,
> {
  criterion: Type;
  formComponent: CriterionFormComponent<Type, Criterion>;
  messages: (taskType: TaskType) => {
    name: MessageDescriptor;
  };
}

export interface CriterionFilterDefinition<
  Type extends CriterionType,
  Criterion extends CriterionBase<Type>,
> extends CriterionDefinition<Type, Criterion> {
  initialValues: Criterion;
  matchesFilter: (criterion: Criterion, analysis: CurrentAnalysis) => boolean;
}

export type DefinitionCriterion<T> =
  T extends CriterionDefinition<infer _Type, infer Criterion>
    ? Criterion
    : never;

export type DefinitionCriterionType<T> =
  T extends CriterionFormComponent<infer Type, infer _Criterion> ? Type : never;
