import { defineMessages } from "react-intl";
import {
  FunctionCallFilterCriterion,
  FunctionCallFilterCriterionParameters,
} from ".";
import { CriterionFormComponent } from "../criterion-base";
import MinMaxRange from "@/components/form/MinMaxRange";
import { AstCriterionType } from "@/data-analyzer/analyze-asts";
import { useMemo } from "react";
import Select from "@/components/form/Select";

const messages = defineMessages({
  functionName: {
    id: "FunctionCallCriterionFilterForm.functionName",
    defaultMessage: "Function Name",
  },
  anyFunction: {
    id: "FunctionCallCriterionFilterForm.anyFunction",
    defaultMessage: "Any function",
  },
  count: {
    id: "FunctionCallCriterionFilterForm.count",
    defaultMessage: "Number of function calls",
  },
});

const FunctionCallCriterionFilterForm: CriterionFormComponent<
  AstCriterionType.functionCall,
  FunctionCallFilterCriterion,
  FunctionCallFilterCriterionParameters
> = ({
  value,
  onChange,
  parameters: { minCallsByFunctionName, maxCallsByFunctionName },
}) => {
  const minNumberOfFunctionCalls = useMemo(() => {
    if (value.functionName.length === 0) {
      // return the sum of all minimum calls if no function name is specified
      // as in this case we consider all function calls
      return Object.values(minCallsByFunctionName).reduce(
        (sum, calls) => sum + calls,
        0,
      );
    }

    if (value.functionName in minCallsByFunctionName) {
      return minCallsByFunctionName[value.functionName];
    }

    return 0;
  }, [value.functionName, minCallsByFunctionName]);

  const maxNumberOfFunctionCalls = useMemo(() => {
    if (value.functionName.length === 0) {
      // return the sum of all minimum calls if no function name is specified
      // as in this case we consider all function calls
      return Object.values(maxCallsByFunctionName).reduce(
        (sum, calls) => sum + calls,
        0,
      );
    }

    if (value.functionName in maxCallsByFunctionName) {
      return maxCallsByFunctionName[value.functionName];
    }

    return 0;
  }, [value.functionName, maxCallsByFunctionName]);

  const options = useMemo(
    () => [
      {
        label: messages.anyFunction,
        value: "",
      },
      ...Object.keys(minCallsByFunctionName).map((name) => ({
        label: name,
        value: name,
      })),
    ],
    [minCallsByFunctionName],
  );

  return (
    <form data-testid="function-call-filter-form">
      <Select
        label={messages.functionName}
        data-testid="functionName"
        value={value.functionName}
        onChange={(e) => onChange({ ...value, functionName: e.target.value })}
        options={options}
        alwaysShow
      />

      <MinMaxRange
        min={minNumberOfFunctionCalls}
        max={maxNumberOfFunctionCalls}
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
};

export default FunctionCallCriterionFilterForm;
