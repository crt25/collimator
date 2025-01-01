import { defineMessages } from "react-intl";
import {
  ConditionFilterCriterion,
  ConditionFilterCriterionParameters,
} from ".";
import { CriterionFormComponent } from "../criterion-base";
import MinMaxRange from "@/components/form/MinMaxRange";
import { AstCriterionType } from "@/data-analyzer/analyze-asts";

const messages = defineMessages({
  count: {
    id: "ConditionCriterionFilterForm.count",
    defaultMessage: "Number of conditions",
  },
});

const ConditionCriterionFilterForm: CriterionFormComponent<
  AstCriterionType.condition,
  ConditionFilterCriterion,
  ConditionFilterCriterionParameters
> = ({
  value,
  onChange,
  parameters: { minNumberOfConditions, maxNumberOfConditions },
}) => (
  <form data-testid="condition-filter-form">
    <MinMaxRange
      min={minNumberOfConditions}
      max={maxNumberOfConditions}
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

export default ConditionCriterionFilterForm;
