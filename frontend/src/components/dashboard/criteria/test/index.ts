import { defineMessages } from "react-intl";
import {
  CriterionAxisDefinition,
  CriterionBase,
  CriterionFilterDefinition,
} from "../criterion-base";
import { MetaCriterionType } from "../meta-criterion-type";
import TestCriterionFilterForm from "./TestCriterionFilterForm";

const criterion = MetaCriterionType.test;
type Criterion = typeof criterion;

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

export interface TestFilterCriterionParameters extends CriterionBase<Criterion> {
  minPassedTests: number;
  maxPassedTests: number;
}

export const TestCriterionAxis: CriterionAxisDefinition<Criterion> = {
  criterion,
  messages: () => messages,
  config: {
    type: "linear",
    ticks: {
      precision: 0,
    },
  },
  getAxisValue: (analysis) => {
    return analysis.tests.filter((t) => t.passed).length;
  },
};

export const TestCriterionFilter: CriterionFilterDefinition<
  Criterion,
  TestFilterCriterion,
  TestFilterCriterionParameters
> = {
  criterion,
  formComponent: TestCriterionFilterForm,
  messages: () => messages,
  initialValues: {
    criterion,
    minimumCount: 0,
    maximumCount: 100,
  },
  run: (config, analyses) => {
    const passedTestsList = analyses.map(
      (a) => a.tests.filter((t) => t.passed).length,
    );

    return {
      matchesFilter: passedTestsList.map(
        (passedTests) =>
          config.minimumCount <= passedTests &&
          config.maximumCount >= passedTests,
      ),
      parameters: {
        criterion: MetaCriterionType.test,
        minPassedTests: Math.min(...passedTestsList),
        maxPassedTests: Math.max(...passedTestsList),
      },
    };
  },
};
