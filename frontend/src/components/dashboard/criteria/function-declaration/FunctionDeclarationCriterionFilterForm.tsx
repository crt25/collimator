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
import { CriterionType } from "@/data-analyzer/analyze-asts";
import { FunctionDeclarationFilterCriterion } from ".";

const messages = defineMessages({
  count: {
    id: "FunctionDeclarationCriterionFilterForm.count",
    defaultMessage: "Number of function declarations",
  },
});

type FormValues = Omit<FunctionDeclarationFilterCriterion, "criterion">;

const FunctionDeclarationCriterionFilterForm: CriterionFormComponent<
  CriterionType.functionDeclaration,
  FunctionDeclarationFilterCriterion
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
        criterion: CriterionType.functionDeclaration,
        ...formValues,
      });
    },
    [onUpdate],
  );

  const minimumCount = watch("minimumCount");
  const maximumCount = watch("maximumCount");

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      data-testid="function-declaration-filter-form"
    >
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

export default FunctionDeclarationCriterionFilterForm;
