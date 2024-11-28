import { defineMessages } from "react-intl";
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

const min = 0;
const max = 100;
const FunctionCallCriterionFilterForm: CriterionFormComponent<
  AstCriterionType.functionCall,
  FunctionCallFilterCriterion
> = ({ value, onChange }) => (
  <form data-testid="function-call-filter-form">
    <Input
      label={messages.functionName}
      data-testid="functionName"
      value={value.functionName}
      onChange={(e) => onChange({ ...value, functionName: e.target.value })}
    />

    <MinMaxRange
      min={min}
      max={max}
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

export default FunctionCallCriterionFilterForm;
