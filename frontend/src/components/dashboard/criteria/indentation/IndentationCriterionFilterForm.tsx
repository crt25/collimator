import { defineMessages } from "react-intl";
import {
  IndentationFilterCriterion,
  IndentationFilterCriterionParameters,
} from ".";
import { CriterionFormComponent } from "../criterion-base";
import MinMaxRange from "@/components/form/MinMaxRange";
import { AstCriterionType } from "@/data-analyzer/analyze-asts";

const messages = defineMessages({
  level: {
    id: "IndentationCriterionFilterForm.level",
    defaultMessage: "Level of code indentation",
  },
});

const IndentationCriterionFilterForm: CriterionFormComponent<
  AstCriterionType.indentation,
  IndentationFilterCriterion,
  IndentationFilterCriterionParameters
> = ({
  value,
  onChange,
  parameters: { minimumIndentation, maximumIndentation },
}) => (
  <form data-testid="indentation-filter-form">
    <MinMaxRange
      min={minimumIndentation}
      max={maximumIndentation}
      valueMin={value.minimumIndentation}
      valueMax={value.maximumIndentation}
      onChange={(min, max) =>
        onChange({
          ...value,
          minimumIndentation: min,
          maximumIndentation: max,
        })
      }
      label={messages.level}
    />
  </form>
);

export default IndentationCriterionFilterForm;
