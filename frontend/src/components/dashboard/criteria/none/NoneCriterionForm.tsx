import { NoneCriterion, NoneCriterionParameters } from ".";
import { CriterionFormComponent } from "../criterion-base";
import { MetaCriterionType } from "../meta-criterion-type";

const NoneCriterionForm: CriterionFormComponent<
  MetaCriterionType.none,
  NoneCriterion,
  NoneCriterionParameters
> = () => null;

export default NoneCriterionForm;
