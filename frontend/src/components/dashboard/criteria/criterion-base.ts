import { MessageDescriptor } from "react-intl";
import { ChartConfiguration } from "chart.js";
import { TaskType } from "@/api/collimator/generated/models";
import { CurrentAnalysis } from "@/api/collimator/models/solutions/current-analysis";
import { CriterionType } from "./criterion-type";

export interface CriterionBase<Type extends CriterionType> {
  criterion: Type;
}

export type CriterionFormProps<
  Type extends CriterionType,
  Criterion extends CriterionBase<Type>,
  Parameters extends CriterionBase<Type>,
> = {
  value: Criterion;
  parameters: Parameters;
  onChange: (criteron: Criterion) => void;
};

export type CriterionFormComponent<
  Type extends CriterionType,
  Criterion extends CriterionBase<Type>,
  Parameters extends CriterionBase<Type>,
> = React.FunctionComponent<CriterionFormProps<Type, Criterion, Parameters>>;

export type AxisConfig = Exclude<
  Exclude<ChartConfiguration<"bubble">["options"], undefined>["scales"],
  undefined
>["x"];

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
  Parameters extends CriterionBase<Type>,
> {
  criterion: Type;
  formComponent: CriterionFormComponent<Type, Criterion, Parameters>;
  messages: (taskType: TaskType) => {
    name: MessageDescriptor;
  };
}

export interface CriterionFilterDefinition<
  Type extends CriterionType,
  Criterion extends CriterionBase<Type>,
  Parameters extends CriterionBase<Type>,
> extends CriterionDefinition<Type, Criterion, Parameters> {
  initialValues: Criterion;
  run: (
    criterion: Criterion,
    analyses: CurrentAnalysis[],
  ) => {
    matchesFilter: boolean[];
    parameters: Parameters;
  };
}

export type DefinitionCriterion<T> =
  T extends CriterionDefinition<infer _Type, infer Criterion, infer _Params>
    ? Criterion
    : never;

export type DefinitionCriterionType<T> =
  T extends CriterionFormComponent<infer Type, infer _Criterion, infer _Params>
    ? Type
    : never;

export type FilterDefinitionParameters<T> =
  T extends CriterionFilterDefinition<
    infer _Type,
    infer _Criterion,
    infer CriterionParameters
  >
    ? CriterionParameters
    : never;
