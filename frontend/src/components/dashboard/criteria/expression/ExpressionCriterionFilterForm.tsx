import { defineMessages } from "react-intl";
import MinMaxRange from "@/components/form/MinMaxRange";
import { AstCriterionType } from "@/data-analyzer/analyze-asts";
import { CriterionFormComponent } from "../criterion-base";
import {
  ExpressionFilterCriterion,
  ExpressionFilterCriterionParameters,
} from ".";

const messages = defineMessages({
  count: {
    id: "ExpressionCriterionFilterForm.count",
    defaultMessage: "Number of expressions",
  },
});

const ExpressionCriterionFilterForm: CriterionFormComponent<
  AstCriterionType.expression,
  ExpressionFilterCriterion,
  ExpressionFilterCriterionParameters
> = ({
  value,
  onChange,
  parameters: { minNumberOfExpressions, maxNumberOfExpressions },
}) => (
  <form data-testid="expression-filter-form">
    <MinMaxRange
      min={minNumberOfExpressions}
      max={maxNumberOfExpressions}
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

export default ExpressionCriterionFilterForm;
