import { AstFilter, FilterCriterionType, FilterDefinitionByCriterion } from ".";
import React from "react";
import { match } from "ts-pattern";
import { CriterionType } from "@/data-analyzer/analyze-asts";
import { NoCriterionFilter } from "../criteria/none";
import { ConditionCriterionFilter } from "../criteria/condition";
import { FunctionCallCriterionFilter } from "../criteria/function-call";
import { StatementCriterionFilter } from "../criteria/statement";
import { ExpressionCriterionFilter } from "../criteria/expression";
import { LoopCriterionFilter } from "../criteria/loop";
import { FunctionDeclarationCriterionFilter } from "../criteria/function-declaration";

type FilterFormByCriterion = {
  [key in FilterCriterionType]: FilterDefinitionByCriterion[key]["formComponent"];
};

type Props<Type extends AstFilter["criterion"]> = {
  criterion: Type;
  props: React.ComponentPropsWithoutRef<FilterFormByCriterion[Type]>;
};

const CriterionFilterForm = (props: Props<FilterCriterionType>) =>
  match(props)
    .with(
      { criterion: CriterionType.none },
      ({ props }: Props<CriterionType.none>) => (
        <NoCriterionFilter.formComponent {...props} />
      ),
    )
    .with(
      { criterion: CriterionType.statement },
      ({ props }: Props<CriterionType.statement>) => (
        <StatementCriterionFilter.formComponent {...props} />
      ),
    )
    .with(
      { criterion: CriterionType.expression },
      ({ props }: Props<CriterionType.expression>) => (
        <ExpressionCriterionFilter.formComponent {...props} />
      ),
    )
    .with(
      { criterion: CriterionType.condition },
      ({ props }: Props<CriterionType.condition>) => (
        <ConditionCriterionFilter.formComponent {...props} />
      ),
    )
    .with(
      { criterion: CriterionType.loop },
      ({ props }: Props<CriterionType.loop>) => (
        <LoopCriterionFilter.formComponent {...props} />
      ),
    )
    .with(
      { criterion: CriterionType.functionCall },
      ({ props }: Props<CriterionType.functionCall>) => (
        <FunctionCallCriterionFilter.formComponent {...props} />
      ),
    )
    .with(
      { criterion: CriterionType.functionDeclaration },
      ({ props }: Props<CriterionType.functionDeclaration>) => (
        <FunctionDeclarationCriterionFilter.formComponent {...props} />
      ),
    )
    .exhaustive();

export default CriterionFilterForm;
