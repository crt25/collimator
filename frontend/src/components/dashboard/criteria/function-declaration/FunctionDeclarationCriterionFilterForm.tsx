import { defineMessages } from "react-intl";
import { CriterionFormComponent } from "../criterion-base";
import MinMaxRange from "@/components/form/MinMaxRange";
import { AstCriterionType } from "@/data-analyzer/analyze-asts";
import { FunctionDeclarationFilterCriterion } from ".";

const messages = defineMessages({
  count: {
    id: "FunctionDeclarationCriterionFilterForm.count",
    defaultMessage: "Number of function declarations",
  },
});

const min = 0;
const max = 100;

const FunctionDeclarationCriterionFilterForm: CriterionFormComponent<
  AstCriterionType.functionDeclaration,
  FunctionDeclarationFilterCriterion
> = ({ value, onChange }) => (
  <form data-testid="function-declaration-filter-form">
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

export default FunctionDeclarationCriterionFilterForm;
