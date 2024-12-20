import { defineMessages } from "react-intl";
import { AstHeightFilterCriterion } from ".";
import { CriterionFormComponent } from "../criterion-base";
import MinMaxRange from "@/components/form/MinMaxRange";
import { AstCriterionType } from "@/data-analyzer/analyze-asts";

const messages = defineMessages({
  count: {
    id: "AstHeightCriterionFilterForm.count",
    defaultMessage: "Height of the AST",
  },
});

const min = 0;
const max = 100;

const AstHeightCriterionFilterForm: CriterionFormComponent<
  AstCriterionType.height,
  AstHeightFilterCriterion
> = ({ value, onChange }) => (
  <form data-testid="ast-height-filter-form">
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

export default AstHeightCriterionFilterForm;
