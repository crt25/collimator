import { TaskType } from "@/api/collimator/generated/models";
import {
  CriteriaBasedAnalyzerOutput,
  CriteriaToAnalyzeInput,
  CriterionType,
} from "@/data-analyzer/analyze-asts";
import { MessageDescriptor } from "react-intl";

export interface CriterionBase<Type extends CriterionType> {
  criterion: Type;
}

export type CriterionFormProps<
  Type extends CriterionType,
  Criterion extends CriterionBase<Type>,
> = {
  submitMessage: MessageDescriptor;
  initialValues: Partial<Omit<Criterion, "criterion">>;
  onUpdate: (criteron: Criterion) => void;
};

export type CriterionFormComponent<
  Type extends CriterionType,
  Criterion extends CriterionBase<Type>,
> = React.FunctionComponent<CriterionFormProps<Type, Criterion>>;

export interface CriterionAxisDefinition<Type extends CriterionType> {
  criterion: Type;
  messages: (taskType: TaskType) => {
    name: MessageDescriptor;
  };
  analysisInput: CriteriaToAnalyzeInput<Type>;
  getAxisValue: (output: CriteriaBasedAnalyzerOutput[Type]) => number;
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
  toAnalysisInput: (criterion: Criterion) => CriteriaToAnalyzeInput<Type>;
}

export interface AstGroup<Type extends CriterionType> {
  criterion: Type;
}

export interface CriterionFilterDefinition<
  Type extends CriterionType,
  Criterion extends CriterionBase<Type>,
> extends CriterionDefinition<Type, Criterion> {
  matchesFilter: (
    criterion: Criterion,
    output: CriteriaBasedAnalyzerOutput[Type],
  ) => boolean;
}

export interface CriterionGroupDefinition<
  Type extends CriterionType,
  Criterion extends CriterionBase<Type>,
> extends CriterionDefinition<Type, Criterion> {
  getGroup: (
    criterion: Criterion,
    output: CriteriaBasedAnalyzerOutput[Type],
  ) => string;
}

export type DefinitionCriterion<T> =
  T extends CriterionDefinition<infer _Type, infer Criterion>
    ? Criterion
    : never;

export type DefinitionCriterionType<T> =
  T extends CriterionFormComponent<infer Type, infer _Criterion> ? Type : never;
