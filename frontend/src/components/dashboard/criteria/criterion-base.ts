import { CriterionType } from "@/data-analyzer/analyze-asts";
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

export interface CriterionDefinition<
  Type extends CriterionType,
  Criterion extends CriterionBase<Type>,
> {
  criterion: Type;
  formComponent: CriterionFormComponent<Type, Criterion>;
  messages: {
    name: MessageDescriptor;
  };
}

export type DefinitionCriterion<T> =
  T extends CriterionDefinition<infer _Type, infer Criterion>
    ? Criterion
    : never;

export type DefinitionCriterionType<T> =
  T extends CriterionFormComponent<infer Type, infer _Criterion> ? Type : never;
