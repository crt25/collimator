import SubmitFormButton from "@/components/form/SubmitFormButton";
import { defineMessages } from "react-intl";
import { useYupSchema } from "@/hooks/useYupSchema";
import * as yup from "yup";
import { useYupResolver } from "@/hooks/useYupResolver";
import { useForm } from "react-hook-form";
import { useCallback, useMemo } from "react";
import ValidationErrorMessage from "@/components/form/ValidationErrorMessage";
import { CriterionFormComponent } from "../criterion-base";
import MinMaxRange from "@/components/form/MinMaxRange";
import { AstCriterionType } from "@/data-analyzer/analyze-asts";
import { LoopFilterCriterion } from ".";

const messages = defineMessages({
  count: {
    id: "LoopCriterionFilterForm.count",
    defaultMessage: "Number of loops",
  },
});

type FormValues = Omit<LoopFilterCriterion, "criterion">;

const LoopCriterionFilterForm: CriterionFormComponent<
  AstCriterionType.loop,
  LoopFilterCriterion
> = ({ submitMessage, onUpdate, initialValues }) => {
  const min = 0;
  const max = 100;

  const schema = useYupSchema({
    minimumCount: yup.number().required(),
    maximumCount: yup.number().required(),
  });

  const resolver = useYupResolver(schema);

  const defaultValues = useMemo(
    () => ({
      minimumCount: initialValues?.minimumCount ?? min,
      maximumCount: initialValues?.maximumCount ?? max,
    }),
    [initialValues],
  );

  const {
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<FormValues>({
    resolver,
    defaultValues,
  });

  const onSubmit = useCallback(
    (formValues: FormValues) => {
      onUpdate({
        criterion: AstCriterionType.loop,
        ...formValues,
      });
    },
    [onUpdate],
  );

  const minimumCount = watch("minimumCount");
  const maximumCount = watch("maximumCount");

  return (
    <form onSubmit={handleSubmit(onSubmit)} data-testid="loop-filter-form">
      <MinMaxRange
        min={min}
        max={max}
        valueMin={minimumCount}
        valueMax={maximumCount}
        onChange={(min, max) => {
          setValue("minimumCount", min);
          setValue("maximumCount", max);
        }}
        label={messages.count}
      >
        <ValidationErrorMessage>
          {[errors.minimumCount?.message, errors.maximumCount?.message]}
        </ValidationErrorMessage>
      </MinMaxRange>

      <SubmitFormButton label={submitMessage} />
    </form>
  );
};

export default LoopCriterionFilterForm;
