import { defineMessages } from "react-intl";
import { TestFilterCriterion } from ".";
import { CriterionFormComponent } from "../criterion-base";
import MinMaxRange from "@/components/form/MinMaxRange";
import { MetaCriterionType } from "../meta-criterion-type";

const messages = defineMessages({
  count: {
    id: "TestCriterionFilterForm.count",
    defaultMessage: "Number of passed tests",
  },
});

const min = 0;
const max = 100;

const TestCriterionFilterForm: CriterionFormComponent<
  MetaCriterionType.test,
  TestFilterCriterion
> = ({ value, onChange }) => (
  <form data-testid="test-filter-form">
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

export default TestCriterionFilterForm;
