import { defineMessages } from "react-intl";
import MinMaxRange from "@/components/form/MinMaxRange";
import { AstCriterionType } from "@/data-analyzer/analyze-asts";
import { CriterionFormComponent } from "../criterion-base";
import {
  FunctionDeclarationFilterCriterion,
  FunctionDeclarationFilterCriterionParameters,
} from ".";

const messages = defineMessages({
  count: {
    id: "FunctionDeclarationCriterionFilterForm.count",
    defaultMessage: "Number of function declarations",
  },
});

const FunctionDeclarationCriterionFilterForm: CriterionFormComponent<
  AstCriterionType.functionDeclaration,
  FunctionDeclarationFilterCriterion,
  FunctionDeclarationFilterCriterionParameters
> = ({
  value,
  onChange,
  parameters: {
    minNumberOfFunctionDeclarations,
    maxNumberOfFunctionDeclarations,
  },
}) => (
  <form data-testid="function-declaration-filter-form">
    <MinMaxRange
      min={minNumberOfFunctionDeclarations}
      max={maxNumberOfFunctionDeclarations}
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
