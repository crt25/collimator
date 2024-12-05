import { FilterCriterion } from ".";
import React from "react";
import { match } from "ts-pattern";
import { AstCriterionType } from "@/data-analyzer/analyze-asts";
import { NoCriterionFilter } from "../criteria/none";
import { ConditionCriterionFilter } from "../criteria/condition";
import { FunctionCallCriterionFilter } from "../criteria/function-call";
import { StatementCriterionFilter } from "../criteria/statement";
import { ExpressionCriterionFilter } from "../criteria/expression";
import { LoopCriterionFilter } from "../criteria/loop";
import { FunctionDeclarationCriterionFilter } from "../criteria/function-declaration";
import { TestCriterionFilter } from "../criteria/test";
import { MetaCriterionType } from "../criteria/meta-criterion-type";

const createProps = <Filter extends FilterCriterion>(
  filter: Filter,
  setFilters: (
    updateFilters: (currentFilters: FilterCriterion[]) => FilterCriterion[],
  ) => void,
): {
  value: Filter;
  onChange: (newFilter: Filter) => void;
} => ({
  value: filter,
  onChange: (newFilter: Filter) => {
    setFilters((currentFilters) => {
      const index = currentFilters.findIndex(
        (f) => f.criterion === filter.criterion,
      );

      // since newFilters will always be the latest value
      // but the caller of this function may be holding onto the old value
      // we need to ignore the update if the filter has been removed
      if (index === -1) {
        return currentFilters;
      }

      const copy = [...currentFilters];
      copy[index] = newFilter;

      return copy;
    });
  },
});

const CriterionFilterForm = ({
  filter,
  setFilters,
}: {
  filter: FilterCriterion;
  setFilters: (
    updateFilters: (currentFilters: FilterCriterion[]) => FilterCriterion[],
  ) => void;
}) =>
  match(filter)
    .with({ criterion: MetaCriterionType.none }, (f) => (
      <NoCriterionFilter.formComponent {...createProps(f, setFilters)} />
    ))
    .with({ criterion: AstCriterionType.statement }, (f) => (
      <StatementCriterionFilter.formComponent {...createProps(f, setFilters)} />
    ))
    .with({ criterion: AstCriterionType.expression }, (f) => (
      <ExpressionCriterionFilter.formComponent
        {...createProps(f, setFilters)}
      />
    ))
    .with({ criterion: AstCriterionType.condition }, (f) => (
      <ConditionCriterionFilter.formComponent {...createProps(f, setFilters)} />
    ))
    .with({ criterion: AstCriterionType.loop }, (f) => (
      <LoopCriterionFilter.formComponent {...createProps(f, setFilters)} />
    ))
    .with({ criterion: AstCriterionType.functionCall }, (f) => (
      <FunctionCallCriterionFilter.formComponent
        {...createProps(f, setFilters)}
      />
    ))
    .with({ criterion: AstCriterionType.functionDeclaration }, (f) => (
      <FunctionDeclarationCriterionFilter.formComponent
        {...createProps(f, setFilters)}
      />
    ))
    .with({ criterion: MetaCriterionType.test }, (f) => (
      <TestCriterionFilter.formComponent {...createProps(f, setFilters)} />
    ))
    .exhaustive();

export default CriterionFilterForm;
