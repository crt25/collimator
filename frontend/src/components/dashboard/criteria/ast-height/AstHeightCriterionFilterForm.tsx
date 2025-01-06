import { defineMessages } from "react-intl";
import MinMaxRange from "@/components/form/MinMaxRange";
import { AstCriterionType } from "@/data-analyzer/analyze-asts";
import { CriterionFormComponent } from "../criterion-base";
import {
  AstHeightFilterCriterion,
  AstHeightFilterCriterionParameters,
} from ".";

const messages = defineMessages({
  count: {
    id: "AstHeightCriterionFilterForm.count",
    defaultMessage: "Height of the AST",
  },
});

const AstHeightCriterionFilterForm: CriterionFormComponent<
  AstCriterionType.height,
  AstHeightFilterCriterion,
  AstHeightFilterCriterionParameters
> = ({
  value,
  onChange,
  parameters: { minimumAstHeight, maximumAstHeight },
}) => (
  <form data-testid="ast-height-filter-form">
    <MinMaxRange
      min={minimumAstHeight}
      max={maximumAstHeight}
      valueMin={value.minimumHeight}
      valueMax={value.maximumHeight}
      onChange={(min, max) =>
        onChange({
          ...value,
          minimumHeight: min,
          maximumHeight: max,
        })
      }
      label={messages.count}
    />
  </form>
);

export default AstHeightCriterionFilterForm;
