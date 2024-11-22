import { CriterionType } from "@/data-analyzer/analyze-asts";
import { NoneCriterion } from ".";
import { CriterionFormComponent } from "../criterion-base";

const NoneCriterionForm: CriterionFormComponent<
  CriterionType.none,
  NoneCriterion
> = () => null;

export default NoneCriterionForm;
