import { defineMessages } from "react-intl";
import {
  CriterionAxisDefinition,
  CriterionBase,
  CriterionFilterDefinition,
} from "../criterion-base";
import TestCriterionFilterForm from "./TestCriterionFilterForm";
import { MetaCriterionType } from "../meta-criterion-type";

type Criterion = MetaCriterionType.test;

const messages = defineMessages({
  name: {
    id: "criteria.test.name",
    defaultMessage: "Passed Tests",
  },
});

export interface TestFilterCriterion extends CriterionBase<Criterion> {
  minimumCount: number;
  maximumCount: number;
}

export const TestCriterionAxis: CriterionAxisDefinition<Criterion> = {
  criterion: MetaCriterionType.test,
  messages: () => messages,
  config: {
    type: "linear",
    ticks: {
      precision: 0,
    },
  },
  getAxisValue: (analysis) => {
    return analysis.passedTests;
  },
};

export const TestCriterionFilter: CriterionFilterDefinition<
  Criterion,
  TestFilterCriterion
> = {
  criterion: MetaCriterionType.test,
  formComponent: TestCriterionFilterForm,
  messages: () => messages,
  initialValues: {
    criterion: MetaCriterionType.test,
    minimumCount: 0,
    maximumCount: 100,
  },
  matchesFilter: (config, analysis) => {
    return (
      config.minimumCount <= analysis.passedTests &&
      config.maximumCount >= analysis.passedTests
    );
  },
};
