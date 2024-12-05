import { defineMessages } from "react-intl";
import { ConditionFilterCriterion } from ".";
import { CriterionFormComponent } from "../criterion-base";
import MinMaxRange from "@/components/form/MinMaxRange";
import { AstCriterionType } from "@/data-analyzer/analyze-asts";

const messages = defineMessages({
  count: {
    id: "ConditionCriterionFilterForm.count",
    defaultMessage: "Number of conditions",
  },
});

const min = 0;
const max = 100;

const ConditionCriterionFilterForm: CriterionFormComponent<
  AstCriterionType.condition,
  ConditionFilterCriterion
> = ({ value, onChange }) => (
  <form data-testid="condition-filter-form">
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

export default ConditionCriterionFilterForm;
