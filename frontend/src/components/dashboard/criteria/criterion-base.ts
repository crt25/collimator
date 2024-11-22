import { MessageDescriptor } from "react-intl";
import { CriteronType } from "./criterion-type";

export interface CriterionBase<Type extends CriteronType> {
  criterion: Type;
}

export type CriterionFormProps<
  Type extends CriteronType,
  Criterion extends CriterionBase<Type>,
> = {
  submitMessage: MessageDescriptor;
  initialValues: Partial<Omit<Criterion, "criterion">>;
  onUpdate: (criteron: Criterion) => void;
};

export type CriterionFormComponent<
  Type extends CriteronType,
  Criterion extends CriterionBase<Type>,
> = React.FunctionComponent<CriterionFormProps<Type, Criterion>>;

export interface CriterionDefinition<
  Type extends CriteronType,
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
