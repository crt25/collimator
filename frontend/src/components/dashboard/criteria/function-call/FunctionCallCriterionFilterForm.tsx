import SubmitFormButton from "@/components/form/SubmitFormButton";
import { defineMessages } from "react-intl";
import { useYupSchema } from "@/hooks/useYupSchema";
import * as yup from "yup";
import { useYupResolver } from "@/hooks/useYupResolver";
import { useForm } from "react-hook-form";
import { useCallback, useMemo } from "react";
import ValidationErrorMessage from "@/components/form/ValidationErrorMessage";
import { FunctionCallFilterCriterion } from ".";
import { CriterionFormComponent } from "../criterion-base";
import MinMaxRange from "@/components/form/MinMaxRange";
import { AstCriterionType } from "@/data-analyzer/analyze-asts";
import Input from "@/components/form/Input";

const messages = defineMessages({
  functionName: {
    id: "FunctionCallCriterionFilterForm.functionName",
    defaultMessage: "Function Name",
  },
  count: {
    id: "FunctionCallCriterionFilterForm.count",
    defaultMessage: "Number of function calls",
  },
});

type FormValues = Omit<FunctionCallFilterCriterion, "criterion">;

const FunctionCallCriterionFilterForm: CriterionFormComponent<
  AstCriterionType.functionCall,
  FunctionCallFilterCriterion
> = ({ submitMessage, onUpdate, initialValues }) => {
  const min = 0;
  const max = 100;

  const schema = useYupSchema({
    functionName: yup.string(),
    minimumCount: yup.number().required(),
    maximumCount: yup.number().required(),
  });

  const resolver = useYupResolver(schema);

  const defaultValues = useMemo(
    () => ({
      functionName: initialValues?.functionName ?? "",
      minimumCount: initialValues?.minimumCount ?? min,
      maximumCount: initialValues?.maximumCount ?? max,
    }),
    [initialValues],
  );

  const {
    handleSubmit,
    formState: { errors },
    register,
    watch,
    setValue,
  } = useForm<FormValues>({
    resolver,
    defaultValues,
  });

  const onSubmit = useCallback(
    (formValues: FormValues) => {
      onUpdate({
        criterion: AstCriterionType.functionCall,
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
      data-testid="function-call-filter-form"
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

export default FunctionCallCriterionFilterForm;
