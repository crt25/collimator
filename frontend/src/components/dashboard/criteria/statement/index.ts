import { defineMessages } from "react-intl";
import {
  CriterionAxisDefinition,
  CriterionBase,
  CriterionFilterDefinition,
} from "../criterion-base";
import {
  analyzeAst,
  CriteriaToAnalyzeInput,
  AstCriterionType,
} from "@/data-analyzer/analyze-asts";
import StatementCriterionFilterForm from "./StatementCriterionFilterForm";

type Criterion = AstCriterionType.statement;

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

const toAnalysisInput = (
  _config: StatementFilterCriterion,
): CriteriaToAnalyzeInput<AstCriterionType.statement> => ({
  criterion: AstCriterionType.statement,
  input: undefined,
});

export const StatementCriterionAxis: CriterionAxisDefinition<Criterion> = {
  criterion: AstCriterionType.statement,
  messages: () => messages,
  config: {
    type: "linear",
    ticks: {
      precision: 0,
    },
  },
  getAxisValue: (analysis) => {
    const numberOfStatements = analyzeAst(analysis.generalAst, {
      criterion: AstCriterionType.statement,
      input: undefined,
    }).output;

    return numberOfStatements;
  },
};

export const StatementCriterionFilter: CriterionFilterDefinition<
  Criterion,
  StatementFilterCriterion
> = {
  criterion: AstCriterionType.statement,
  formComponent: StatementCriterionFilterForm,
  messages: () => messages,
  initialValues: {
    criterion: AstCriterionType.statement,
    minimumCount: 0,
    maximumCount: 100,
  },
  matchesFilter: (config, analysis) => {
    const numberOfStatements = analyzeAst(
      analysis.generalAst,
      toAnalysisInput(config),
    ).output;

    return (
      config.minimumCount <= numberOfStatements &&
      config.maximumCount >= numberOfStatements
    );
  },
};
