import SubmitFormButton from "@/components/form/SubmitFormButton";
import { defineMessages } from "react-intl";
import { useYupSchema } from "@/hooks/useYupSchema";
import * as yup from "yup";
import { useYupResolver } from "@/hooks/useYupResolver";
import { Controller, useForm } from "react-hook-form";
import { useCallback, useMemo } from "react";
import ValidationErrorMessage from "@/components/form/ValidationErrorMessage";
import { FunctionCallGroupCriterion } from ".";
import { CriterionFormComponent } from "../criterion-base";
import Range from "@/components/form/Range";
import { CriterionType } from "@/data-analyzer/analyze-asts";
import Input from "@/components/form/Input";

type FormValues = Omit<FunctionCallGroupCriterion, "criterion">;

const messages = defineMessages({
  functionName: {
    id: "FunctionCallCriterionGroupForm.functionName",
    defaultMessage: "Function Name",
  },
  granularity: {
    id: "FunctionCallCriterionGroupForm.granularity",
    defaultMessage: "Granularity",
  },
});

const FunctionCallCriterionGroupForm: CriterionFormComponent<
  CriterionType.functionCall,
  FunctionCallGroupCriterion
> = ({ submitMessage, onUpdate, initialValues }) => {
  const min = 1;
  const max = 100;

  const schema = useYupSchema({
    functionName: yup.string(),
    granularity: yup.number().required(),
  });

  const resolver = useYupResolver(schema);

  const defaultValues = useMemo(
    () => ({
      functionName: initialValues?.functionName ?? "",
      granularity: initialValues?.granularity ?? min,
    }),
    [initialValues],
  );

  const {
    handleSubmit,
    formState: { errors },
    register,
    control,
  } = useForm<FormValues>({
    resolver,
    defaultValues,
  });

  const onSubmit = useCallback(
    (formValues: FormValues) => {
      onUpdate({
        criterion: CriterionType.functionCall,
        ...formValues,
      });
    },
    [onUpdate],
  );

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      data-testid="function-call-group-form"
    >
      <Input
        label={messages.functionName}
        {...register("functionName")}
        data-testid="functionName"
      >
        <ValidationErrorMessage>
          {errors.functionName?.message}
        </ValidationErrorMessage>
      </Input>

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

export default FunctionCallCriterionGroupForm;
