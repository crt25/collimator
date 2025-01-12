import { defineMessages } from "react-intl";
import MinMaxRange from "@/components/form/MinMaxRange";
import { CriterionFormComponent } from "../criterion-base";
import { MetaCriterionType } from "../meta-criterion-type";
import { TestFilterCriterion, TestFilterCriterionParameters } from ".";

const messages = defineMessages({
  count: {
    id: "TestCriterionFilterForm.count",
    defaultMessage: "Number of passed tests",
  },
});

const TestCriterionFilterForm: CriterionFormComponent<
  MetaCriterionType.test,
  TestFilterCriterion,
  TestFilterCriterionParameters
> = ({ value, onChange, parameters: { minPassedTests, maxPassedTests } }) => (
  <form data-testid="test-filter-form">
    <MinMaxRange
      min={minPassedTests}
      max={maxPassedTests}
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
