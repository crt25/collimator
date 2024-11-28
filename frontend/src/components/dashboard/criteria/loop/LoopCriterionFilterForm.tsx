import { defineMessages } from "react-intl";
import { CriterionFormComponent } from "../criterion-base";
import MinMaxRange from "@/components/form/MinMaxRange";
import { AstCriterionType } from "@/data-analyzer/analyze-asts";
import { LoopFilterCriterion } from ".";

const messages = defineMessages({
  count: {
    id: "LoopCriterionFilterForm.count",
    defaultMessage: "Number of loops",
  },
});

const min = 0;
const max = 100;

const LoopCriterionFilterForm: CriterionFormComponent<
  AstCriterionType.loop,
  LoopFilterCriterion
> = ({ value, onChange }) => (
  <form data-testid="loop-filter-form">
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

export default LoopCriterionFilterForm;
