import { defineMessages } from "react-intl";
import { CriterionFormComponent } from "../criterion-base";
import MinMaxRange from "@/components/form/MinMaxRange";
import { AstCriterionType } from "@/data-analyzer/analyze-asts";
import {
  StatementFilterCriterion,
  StatementFilterCriterionParameters,
} from ".";

const messages = defineMessages({
  count: {
    id: "StatementCriterionFilterForm.count",
    defaultMessage: "Number of statements",
  },
});

const StatementCriterionFilterForm: CriterionFormComponent<
  AstCriterionType.statement,
  StatementFilterCriterion,
  StatementFilterCriterionParameters
> = ({
  value,
  onChange,
  parameters: { minNumberOfStatements, maxNumberOfStatements },
}) => (
  <form data-testid="statement-filter-form">
    <MinMaxRange
      min={minNumberOfStatements}
      max={maxNumberOfStatements}
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
