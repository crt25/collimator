import SubmitFormButton from "@/components/form/SubmitFormButton";
import { defineMessages } from "react-intl";
import { useYupSchema } from "@/hooks/useYupSchema";
import * as yup from "yup";
import { useYupResolver } from "@/hooks/useYupResolver";
import { Controller, useForm } from "react-hook-form";
import { useCallback, useMemo } from "react";
import ValidationErrorMessage from "@/components/form/ValidationErrorMessage";
import { CriterionFormComponent } from "../criterion-base";
import Range from "@/components/form/Range";
import { CriterionType } from "@/data-analyzer/analyze-asts";
import { LoopGroupCriterion } from ".";

type FormValues = Omit<LoopGroupCriterion, "criterion">;

const messages = defineMessages({
  granularity: {
    id: "LoopCriterionGroupForm.granularity",
    defaultMessage: "Granularity",
  },
});

const LoopCriterionGroupForm: CriterionFormComponent<
  CriterionType.loop,
  LoopGroupCriterion
> = ({ submitMessage, onUpdate, initialValues }) => {
  const min = 1;
  const max = 100;

  const schema = useYupSchema({
    granularity: yup.number().required(),
  });

  const resolver = useYupResolver(schema);

  const defaultValues = useMemo(
    () => ({
      granularity: initialValues?.granularity ?? min,
    }),
    [initialValues],
  );

  const {
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<FormValues>({
    resolver,
    defaultValues,
  });

  const onSubmit = useCallback(
    (formValues: FormValues) => {
      onUpdate({
        criterion: CriterionType.loop,
        ...formValues,
      });
    },
    [onUpdate],
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} data-testid="loop-group-form">
      <Controller
        name="granularity"
        control={control}
        render={({ field }) => (
          <Range
            value={field.value}
            label={messages.granularity}
            min={min}
            max={max}
            onChange={field.onChange}
          >
            <ValidationErrorMessage>
              {errors.granularity?.message}
            </ValidationErrorMessage>
          </Range>
        )}
      />
      <SubmitFormButton label={submitMessage} />
    </form>
  );
};

export default LoopCriterionGroupForm;
