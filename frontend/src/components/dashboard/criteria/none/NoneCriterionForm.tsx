import { NoneCriterion } from ".";
import { CriterionFormComponent } from "../criterion-base";
import { MetaCriterionType } from "../meta-criterion-type";

const NoneCriterionForm: CriterionFormComponent<
  MetaCriterionType.none,
  NoneCriterion
> = () => null;

export default NoneCriterionForm;
