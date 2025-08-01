import React from "react";
import { match } from "ts-pattern";
import { AstCriterionType } from "@/data-analyzer/analyze-asts";
import { NoCriterionFilter } from "../criteria/none";
import { ConditionCriterionFilter } from "../criteria/condition";
import { BuiltInFunctionCallCriterionFilter } from "../criteria/built-in-function-call";
import { StatementCriterionFilter } from "../criteria/statement";
import { ExpressionCriterionFilter } from "../criteria/expression";
import { LoopCriterionFilter } from "../criteria/loop";
import { FunctionDeclarationCriterionFilter } from "../criteria/function-declaration";
import { TestCriterionFilter } from "../criteria/test";
import { MetaCriterionType } from "../criteria/meta-criterion-type";
import { CustomFunctionCallCriterionFilter } from "../criteria/custom-function-call";
import { FilterCriterion, FilterCriterionParameters } from ".";

const createProps = <
  Filter extends FilterCriterion,
  Params extends FilterCriterionParameters,
>(
  {
    filter,
    parameters,
  }: {
    filter: Filter;
    parameters: Params;
  },
  setFilters: (
    updateFilters: (currentFilters: FilterCriterion[]) => FilterCriterion[],
  ) => void,
): {
  value: Filter;
  parameters: Params;
  onChange: (newFilter: Filter) => void;
} => ({
  value: filter,
  parameters,
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
  parameters,
}: {
  filter: FilterCriterion;
  setFilters: (
    updateFilters: (currentFilters: FilterCriterion[]) => FilterCriterion[],
  ) => void;
  parameters: FilterCriterionParameters;
}) =>
  match({
    filter,
    parameters,
  })
    .with(
      {
        filter: { criterion: AstCriterionType.condition },
        parameters: { criterion: AstCriterionType.condition },
      },
      (f) => (
        <ConditionCriterionFilter.formComponent
          {...createProps(f, setFilters)}
        />
      ),
    )
    .with(
      {
        filter: { criterion: AstCriterionType.customFunctionCall },
        parameters: { criterion: AstCriterionType.customFunctionCall },
      },
      (f) => (
        <CustomFunctionCallCriterionFilter.formComponent
          {...createProps(f, setFilters)}
        />
      ),
    )
    .with(
      {
        filter: { criterion: AstCriterionType.expression },
        parameters: { criterion: AstCriterionType.expression },
      },
      (f) => (
        <ExpressionCriterionFilter.formComponent
          {...createProps(f, setFilters)}
        />
      ),
    )
    .with(
      {
        filter: { criterion: AstCriterionType.builtInFunctionCall },
        parameters: { criterion: AstCriterionType.builtInFunctionCall },
      },
      (f) => (
        <BuiltInFunctionCallCriterionFilter.formComponent
          {...createProps(f, setFilters)}
        />
      ),
    )
    .with(
      {
        filter: { criterion: AstCriterionType.functionDeclaration },
        parameters: { criterion: AstCriterionType.functionDeclaration },
      },
      (f) => (
        <FunctionDeclarationCriterionFilter.formComponent
          {...createProps(f, setFilters)}
        />
      ),
    )
    // .with(
    //   {
    //     filter: { criterion: AstCriterionType.height },
    //     parameters: { criterion: AstCriterionType.height },
    //   },
    //   (f) => (
    //     <AstHeightCriterionFilter.formComponent
    //       {...createProps(f, setFilters)}
    //     />
    //   ),
    // )
    // .with(
    //   {
    //     filter: { criterion: AstCriterionType.indentation },
    //     parameters: { criterion: AstCriterionType.indentation },
    //   },
    //   (f) => (
    //     <IndentationCriterionFilter.formComponent
    //       {...createProps(f, setFilters)}
    //     />
    //   ),
    // )
    .with(
      {
        filter: { criterion: AstCriterionType.loop },
        parameters: { criterion: AstCriterionType.loop },
      },
      (f) => (
        <LoopCriterionFilter.formComponent {...createProps(f, setFilters)} />
      ),
    )
    .with(
      {
        filter: { criterion: MetaCriterionType.none },
        parameters: { criterion: MetaCriterionType.none },
      },
      (f) => (
        <NoCriterionFilter.formComponent {...createProps(f, setFilters)} />
      ),
    )
    .with(
      {
        filter: { criterion: AstCriterionType.statement },
        parameters: { criterion: AstCriterionType.statement },
      },
      (f) => (
        <StatementCriterionFilter.formComponent
          {...createProps(f, setFilters)}
        />
      ),
    )
    .with(
      {
        filter: { criterion: MetaCriterionType.test },
        parameters: { criterion: MetaCriterionType.test },
      },
      (f) => (
        <TestCriterionFilter.formComponent {...createProps(f, setFilters)} />
      ),
    )
    .otherwise(() => null);

export default CriterionFilterForm;
