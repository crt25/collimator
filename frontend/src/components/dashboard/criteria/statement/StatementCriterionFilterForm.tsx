import { defineMessages } from "react-intl";
import { CriterionFormComponent } from "../criterion-base";
import MinMaxRange from "@/components/form/MinMaxRange";
import { AstCriterionType } from "@/data-analyzer/analyze-asts";
import { StatementFilterCriterion } from ".";

const messages = defineMessages({
  count: {
    id: "StatementCriterionFilterForm.count",
    defaultMessage: "Number of statements",
  },
});

const min = 0;
const max = 100;

const StatementCriterionFilterForm: CriterionFormComponent<
  AstCriterionType.statement,
  StatementFilterCriterion
> = ({ value, onChange }) => (
  <form data-testid="statement-filter-form">
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

export default StatementCriterionFilterForm;
