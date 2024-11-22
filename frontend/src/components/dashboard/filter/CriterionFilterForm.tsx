import { FormattedMessage } from "react-intl";
import {
  FilterFormByCriterion,
  AstFilter,
  filterFormComponentByCriterion,
} from ".";
import React from "react";

type Form<C extends AstFilter> = FilterFormByCriterion[C["criterion"]];
type Props<C extends AstFilter> = React.ComponentPropsWithoutRef<Form<C>>;

const CriterionFilterForm = <C extends AstFilter>({
  criterion,
  props,
}: {
  criterion: C["criterion"];
  props: Props<C>;
}) => {
  const FormComponent = filterFormComponentByCriterion[
    criterion
  ] as Form<C> as React.FunctionComponent<Props<C>>;

  if (!FormComponent) {
    return (
      <FormattedMessage
        id="CriterionFilterForm.unknownCriterionType"
        defaultMessage="Trying to add an unknown criterion type"
      />
    );
  }

  // @ts-expect-error - Typescript cannot infer that this is a valid assignment
  return <FormComponent {...props} />;
};

export default CriterionFilterForm;
