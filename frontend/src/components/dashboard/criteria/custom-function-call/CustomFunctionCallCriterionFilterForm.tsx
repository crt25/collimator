import { defineMessages } from "react-intl";
import MinMaxRange from "@/components/form/MinMaxRange";
import { AstCriterionType } from "@/data-analyzer/analyze-asts";
import { CriterionFormComponent } from "../criterion-base";
import {
  CustomFunctionCallFilterCriterion,
  CustomFunctionCallFilterCriterionParameters,
} from ".";

const messages = defineMessages({
  count: {
    id: "CustomFunctionCallCriterionFilterForm.count",
    defaultMessage: "Number of custom function callss",
  },
});

const CustomFunctionCallCriterionFilterForm: CriterionFormComponent<
  AstCriterionType.customFunctionCall,
  CustomFunctionCallFilterCriterion,
  CustomFunctionCallFilterCriterionParameters
> = ({
  value,
  onChange,
  parameters: {
    minNumberOfCustomFunctionCalls,
    maxNumberOfCustomFunctionCalls,
  },
}) => (
  <form data-testid="customfunctioncall-filter-form">
    <MinMaxRange
      min={minNumberOfCustomFunctionCalls}
      max={maxNumberOfCustomFunctionCalls}
      valueMin={value.minimumCount}
      valueMax={value.maximumCount}
      onChange={(min, max) =>
        onChange({
          ...value,
          minimumCount: min,
          maximumCount: max,
        })
      }
      label={messages.count}
    />
  </form>
);

export default CustomFunctionCallCriterionFilterForm;
