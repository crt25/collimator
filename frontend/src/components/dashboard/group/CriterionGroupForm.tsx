import React from "react";
import { AstGroup, GroupCriterionType, GroupDefinitionByCriterion } from ".";
import { match } from "ts-pattern";
import { CriterionType } from "@/data-analyzer/analyze-asts";
import { NoCriterionGroup } from "../criteria/none";
import { ConditionCriterionGroup } from "../criteria/condition";
import { FunctionCallCriterionGroup } from "../criteria/function-call";
import { StatementCriterionGroup } from "../criteria/statement";
import { ExpressionCriterionGroup } from "../criteria/expression";
import { LoopCriterionGroup } from "../criteria/loop";
import { FunctionDeclarationCriterionGroup } from "../criteria/function-declaration";

type FilterFormByCriterion = {
  [key in GroupCriterionType]: GroupDefinitionByCriterion[key]["formComponent"];
};

type Props<Type extends AstGroup["criterion"]> = {
  criterion: Type;
  props: React.ComponentPropsWithoutRef<FilterFormByCriterion[Type]>;
};

const CriterionGroupForm = (props: Props<GroupCriterionType>) =>
  match(props)
    .with(
      { criterion: CriterionType.none },
      ({ props }: Props<CriterionType.none>) => (
        <NoCriterionGroup.formComponent {...props} />
      ),
    )
    .with(
      { criterion: CriterionType.statement },
      ({ props }: Props<CriterionType.statement>) => (
        <StatementCriterionGroup.formComponent {...props} />
      ),
    )
    .with(
      { criterion: CriterionType.expression },
      ({ props }: Props<CriterionType.expression>) => (
        <ExpressionCriterionGroup.formComponent {...props} />
      ),
    )
    .with(
      { criterion: CriterionType.condition },
      ({ props }: Props<CriterionType.condition>) => (
        <ConditionCriterionGroup.formComponent {...props} />
      ),
    )
    .with(
      { criterion: CriterionType.loop },
      ({ props }: Props<CriterionType.loop>) => (
        <LoopCriterionGroup.formComponent {...props} />
      ),
    )
    .with(
      { criterion: CriterionType.functionCall },
      ({ props }: Props<CriterionType.functionCall>) => (
        <FunctionCallCriterionGroup.formComponent {...props} />
      ),
    )
    .with(
      { criterion: CriterionType.functionDeclaration },
      ({ props }: Props<CriterionType.functionDeclaration>) => (
        <FunctionDeclarationCriterionGroup.formComponent {...props} />
      ),
    )
    .exhaustive();

export default CriterionGroupForm;
