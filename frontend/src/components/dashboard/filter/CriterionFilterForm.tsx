import { AstFilter, FilterCriterionType, FilterDefinitionByCriterion } from ".";
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
      { criterion: AstCriterionType.none },
      ({ props }: Props<AstCriterionType.none>) => (
        <NoCriterionFilter.formComponent {...props} />
      ),
    )
    .with(
      { criterion: AstCriterionType.statement },
      ({ props }: Props<AstCriterionType.statement>) => (
        <StatementCriterionFilter.formComponent {...props} />
      ),
    )
    .with(
      { criterion: AstCriterionType.expression },
      ({ props }: Props<AstCriterionType.expression>) => (
        <ExpressionCriterionFilter.formComponent {...props} />
      ),
    )
    .with(
      { criterion: AstCriterionType.condition },
      ({ props }: Props<AstCriterionType.condition>) => (
        <ConditionCriterionFilter.formComponent {...props} />
      ),
    )
    .with(
      { criterion: AstCriterionType.loop },
      ({ props }: Props<AstCriterionType.loop>) => (
        <LoopCriterionFilter.formComponent {...props} />
      ),
    )
    .with(
      { criterion: AstCriterionType.functionCall },
      ({ props }: Props<AstCriterionType.functionCall>) => (
        <FunctionCallCriterionFilter.formComponent {...props} />
      ),
    )
    .with(
      { criterion: AstCriterionType.functionDeclaration },
      ({ props }: Props<AstCriterionType.functionDeclaration>) => (
        <FunctionDeclarationCriterionFilter.formComponent {...props} />
      ),
    )
    .exhaustive();

export default CriterionFilterForm;
