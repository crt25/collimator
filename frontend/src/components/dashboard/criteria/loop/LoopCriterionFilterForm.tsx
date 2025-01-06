import { defineMessages } from "react-intl";
import MinMaxRange from "@/components/form/MinMaxRange";
import { AstCriterionType } from "@/data-analyzer/analyze-asts";
import { CriterionFormComponent } from "../criterion-base";
import { LoopFilterCriterion, LoopFilterCriterionParameters } from ".";

const messages = defineMessages({
  count: {
    id: "LoopCriterionFilterForm.count",
    defaultMessage: "Number of loops",
  },
});

const LoopCriterionFilterForm: CriterionFormComponent<
  AstCriterionType.loop,
  LoopFilterCriterion,
  LoopFilterCriterionParameters
> = ({
  value,
  onChange,
  parameters: { minNumberOfLoops, maxNumberOfLoops },
}) => (
  <form data-testid="loop-filter-form">
    <MinMaxRange
      min={minNumberOfLoops}
      max={maxNumberOfLoops}
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
