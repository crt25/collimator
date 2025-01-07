import { CriterionFormComponent } from "../criterion-base";
import { MetaCriterionType } from "../meta-criterion-type";
import { NoneCriterion, NoneCriterionParameters } from ".";

const NoneCriterionForm: CriterionFormComponent<
  MetaCriterionType.none,
  NoneCriterion,
  NoneCriterionParameters
> = () => null;

export default NoneCriterionForm;
