import { defineMessages } from "react-intl";
import {
  analyzeAst,
  CriteriaToAnalyzeInput,
  AstCriterionType,
} from "@/data-analyzer/analyze-asts";
import {
  CriterionAxisDefinition,
  CriterionBase,
  CriterionFilterDefinition,
} from "../criterion-base";
import StatementCriterionFilterForm from "./StatementCriterionFilterForm";

const criterion = AstCriterionType.statement;
type Criterion = typeof criterion;

const messages = defineMessages({
  name: {
    id: "criteria.statement.name",
    defaultMessage: "Statement",
  },
});

export interface StatementFilterCriterion extends CriterionBase<Criterion> {
  minimumCount: number;
  maximumCount: number;
}

export interface StatementFilterCriterionParameters
  extends CriterionBase<Criterion> {
  minNumberOfStatements: number;
  maxNumberOfStatements: number;
}

const toAnalysisInput = (
  _config: StatementFilterCriterion,
): CriteriaToAnalyzeInput<Criterion> => ({
  criterion,
  input: undefined,
});

export const StatementCriterionAxis: CriterionAxisDefinition<Criterion> = {
  criterion,
  messages: () => messages,
  config: {
    type: "linear",
    ticks: {
      precision: 0,
    },
  },
  getAxisValue: (analysis) => {
    const numberOfStatements = analyzeAst(analysis.generalAst, {
      criterion,
      input: undefined,
    }).output;

    return numberOfStatements;
  },
};

export const StatementCriterionFilter: CriterionFilterDefinition<
  Criterion,
  StatementFilterCriterion,
  StatementFilterCriterionParameters
> = {
  criterion,
  formComponent: StatementCriterionFilterForm,
  messages: () => messages,
  initialValues: {
    criterion,
    minimumCount: 0,
    maximumCount: 100,
  },
  run: (config, analyses) => {
    const numberOfStatementsList = analyses.map(
      (analysis) =>
        analyzeAst(analysis.generalAst, toAnalysisInput(config)).output,
    );

    return {
      matchesFilter: numberOfStatementsList.map(
        (numberOfStatements) =>
          config.minimumCount <= numberOfStatements &&
          config.maximumCount >= numberOfStatements,
      ),
      parameters: {
        criterion,
        maxNumberOfStatements: Math.max(...numberOfStatementsList),
        minNumberOfStatements: Math.min(...numberOfStatementsList),
      },
    };
  },
};
