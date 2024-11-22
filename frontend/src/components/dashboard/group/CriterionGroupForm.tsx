import { FormattedMessage } from "react-intl";
import React from "react";
import {
  AstGroup,
  GroupFormByCriterion,
  groupFormComponentByCriterion,
} from ".";

type Form<C extends AstGroup> = GroupFormByCriterion[C["criterion"]];
type Props<C extends AstGroup> = React.ComponentPropsWithoutRef<Form<C>>;

const CriterionGroupForm = <C extends AstGroup>({
  criterion,
  props,
}: {
  criterion: C["criterion"];
  props: Props<C>;
}) => {
  const FormComponent = groupFormComponentByCriterion[
    criterion
  ] as Form<C> as React.FunctionComponent<Props<C>>;

  if (!FormComponent) {
    return (
      <FormattedMessage
        id="CriterionGroupForm.unknownCriterionType"
        defaultMessage="Trying to add an unknown criterion type"
      />
    );
  }

  // @ts-expect-error - Typescript cannot infer that this is a valid assignment
  return <FormComponent {...props} />;
};

export default CriterionGroupForm;
