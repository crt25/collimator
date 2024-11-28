import { AstCriterionType } from "@/data-analyzer/analyze-asts";
import { NoneCriterion } from ".";
import { CriterionFormComponent } from "../criterion-base";

const NoneCriterionForm: CriterionFormComponent<
  AstCriterionType.none,
  NoneCriterion
> = () => null;

export default NoneCriterionForm;
