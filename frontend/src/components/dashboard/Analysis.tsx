import { useCurrentSessionTaskSolutions } from "@/api/collimator/hooks/solutions/useCurrentSessionTaskSolutions";
import { ExistingSessionExtended } from "@/api/collimator/models/sessions/existing-session-extended";
import MultiSwrContent from "../MultiSwrContent";
import { AstFilter } from "./filter";
import { AstGroup } from "./group";
import { useMemo, useState } from "react";
import {
  AnalysisInput,
  AnalysisOutput,
  analyzeAst,
  CriterionType,
} from "@/data-analyzer/analyze-asts";
import { match } from "ts-pattern";
import {
  ConditionCriterionAxis,
  ConditionCriterionFilter,
  ConditionCriterionGroup,
} from "./criteria/condition";
import { AxesCriterionType } from "./axes";
import {
  FunctionCallCriterionAxis,
  FunctionCallCriterionFilter,
  FunctionCallCriterionGroup,
} from "./criteria/function-call";
import {
  StatementCriterionAxis,
  StatementCriterionFilter,
  StatementCriterionGroup,
} from "./criteria/statement";
import {
  ExpressionCriterionAxis,
  ExpressionCriterionFilter,
  ExpressionCriterionGroup,
} from "./criteria/expression";
import {
  LoopCriterionAxis,
  LoopCriterionFilter,
  LoopCriterionGroup,
} from "./criteria/loop";
import {
  FunctionDeclarationCriterionAxis,
  FunctionDeclarationCriterionFilter,
  FunctionDeclarationCriterionGroup,
} from "./criteria/function-declaration";

const getAxisAnalysisInput = (axisType: AxesCriterionType): AnalysisInput =>
  match(axisType)
    .returnType<AnalysisInput>()
    .with(CriterionType.statement, () => StatementCriterionAxis.analysisInput)
    .with(CriterionType.expression, () => ExpressionCriterionAxis.analysisInput)
    .with(CriterionType.condition, () => ConditionCriterionAxis.analysisInput)
    .with(CriterionType.loop, () => LoopCriterionAxis.analysisInput)
    .with(
      CriterionType.functionCall,
      () => FunctionCallCriterionAxis.analysisInput,
    )
    .with(
      CriterionType.functionDeclaration,
      () => FunctionDeclarationCriterionAxis.analysisInput,
    )
    .exhaustive();

const getAxisAnalysisValue = (
  axisType: AxesCriterionType,
  output: AnalysisOutput,
): number =>
  match([axisType, output])
    .returnType<number>()
    .with(
      [CriterionType.statement, { criterion: CriterionType.statement }],
      ([_, output]) => output.output,
    )
    .with(
      [CriterionType.expression, { criterion: CriterionType.expression }],
      ([_, output]) => output.output,
    )
    .with(
      [CriterionType.condition, { criterion: CriterionType.condition }],
      ([_, output]) => output.output,
    )
    .with(
      [CriterionType.loop, { criterion: CriterionType.loop }],
      ([_, output]) => output.output,
    )
    .with(
      [CriterionType.functionCall, { criterion: CriterionType.functionCall }],
      ([_, output]) => output.output,
    )
    .with(
      [
        CriterionType.functionDeclaration,
        { criterion: CriterionType.functionDeclaration },
      ],
      ([_, output]) => output.output,
    )
    .otherwise(() => {
      throw new Error("AST axis does not match output");
    });

const filterToAnalysisInput = (filter: AstFilter): AnalysisInput =>
  match(filter)
    .returnType<AnalysisInput>()
    .with({ criterion: CriterionType.none }, () => {
      throw new Error("Cannot convert 'no criterion' filter to analysis input");
    })
    .with(
      { criterion: CriterionType.statement },
      StatementCriterionFilter.toAnalysisInput,
    )
    .with(
      { criterion: CriterionType.expression },
      ExpressionCriterionFilter.toAnalysisInput,
    )
    .with(
      { criterion: CriterionType.condition },
      ConditionCriterionFilter.toAnalysisInput,
    )
    .with(
      { criterion: CriterionType.loop },
      LoopCriterionFilter.toAnalysisInput,
    )
    .with(
      { criterion: CriterionType.functionCall },
      FunctionCallCriterionFilter.toAnalysisInput,
    )
    .with(
      { criterion: CriterionType.functionDeclaration },
      FunctionDeclarationCriterionFilter.toAnalysisInput,
    )
    .exhaustive();

const matchesFilter = (criterion: AstFilter, output: AnalysisOutput): boolean =>
  match([criterion, output])
    .with(
      [
        { criterion: CriterionType.statement },
        { criterion: CriterionType.statement },
      ],
      ([criterion, output]) =>
        StatementCriterionFilter.matchesFilter(criterion, output.output),
    )
    .with(
      [
        { criterion: CriterionType.expression },
        { criterion: CriterionType.expression },
      ],
      ([criterion, output]) =>
        ExpressionCriterionFilter.matchesFilter(criterion, output.output),
    )
    .with(
      [
        { criterion: CriterionType.condition },
        { criterion: CriterionType.condition },
      ],
      ([criterion, output]) =>
        ConditionCriterionFilter.matchesFilter(criterion, output.output),
    )
    .with(
      [{ criterion: CriterionType.loop }, { criterion: CriterionType.loop }],
      ([criterion, output]) =>
        LoopCriterionFilter.matchesFilter(criterion, output.output),
    )
    .with(
      [
        { criterion: CriterionType.functionCall },
        { criterion: CriterionType.functionCall },
      ],
      ([criterion, output]) =>
        FunctionCallCriterionFilter.matchesFilter(criterion, output.output),
    )
    .with(
      [
        { criterion: CriterionType.functionDeclaration },
        { criterion: CriterionType.functionDeclaration },
      ],
      ([criterion, output]) =>
        FunctionDeclarationCriterionFilter.matchesFilter(
          criterion,
          output.output,
        ),
    )
    .otherwise(() => {
      throw new Error("AST filter does not match output");
    });

const groupToAnalysisInput = (filter: AstGroup): AnalysisInput =>
  match(filter)
    .returnType<AnalysisInput>()
    .with({ criterion: CriterionType.none }, () => {
      throw new Error("Cannot convert 'no criterion' group to analysis input");
    })
    .with(
      { criterion: CriterionType.statement },
      StatementCriterionGroup.toAnalysisInput,
    )
    .with(
      { criterion: CriterionType.expression },
      ExpressionCriterionGroup.toAnalysisInput,
    )
    .with(
      { criterion: CriterionType.condition },
      ConditionCriterionGroup.toAnalysisInput,
    )
    .with({ criterion: CriterionType.loop }, LoopCriterionGroup.toAnalysisInput)
    .with(
      { criterion: CriterionType.functionCall },
      FunctionCallCriterionGroup.toAnalysisInput,
    )
    .with(
      { criterion: CriterionType.functionDeclaration },
      FunctionDeclarationCriterionGroup.toAnalysisInput,
    )
    .exhaustive();

const getGroup = (criterion: AstGroup, output: AnalysisOutput): string =>
  match([criterion, output])
    .with(
      [
        { criterion: CriterionType.statement },
        { criterion: CriterionType.statement },
      ],
      ([criterion, output]) =>
        StatementCriterionGroup.getGroup(criterion, output.output),
    )
    .with(
      [
        { criterion: CriterionType.expression },
        { criterion: CriterionType.expression },
      ],
      ([criterion, output]) =>
        ExpressionCriterionGroup.getGroup(criterion, output.output),
    )
    .with(
      [
        { criterion: CriterionType.condition },
        { criterion: CriterionType.condition },
      ],
      ([criterion, output]) =>
        ConditionCriterionGroup.getGroup(criterion, output.output),
    )
    .with(
      [{ criterion: CriterionType.loop }, { criterion: CriterionType.loop }],
      ([criterion, output]) =>
        LoopCriterionGroup.getGroup(criterion, output.output),
    )
    .with(
      [
        { criterion: CriterionType.functionCall },
        { criterion: CriterionType.functionCall },
      ],
      ([criterion, output]) =>
        FunctionCallCriterionGroup.getGroup(criterion, output.output),
    )
    .with(
      [
        { criterion: CriterionType.functionDeclaration },
        { criterion: CriterionType.functionDeclaration },
      ],
      ([criterion, output]) =>
        FunctionDeclarationCriterionGroup.getGroup(criterion, output.output),
    )
    .otherwise(() => {
      throw new Error("AST filter does not match output");
    });

const Analysis = ({
  session,
  taskId,
  filters,
  groups,
}: {
  session: ExistingSessionExtended;
  taskId: number;
  filters: AstFilter[];
  groups: AstGroup[];
}) => {
  const [xAxis, setXAxis] = useState<AxesCriterionType>(
    CriterionType.condition,
  );
  const [yAxis, setYAxis] = useState<AxesCriterionType>(
    CriterionType.condition,
  );

  const {
    data: solutions,
    isLoading: isLoadingSolutions,
    error: solutionsError,
  } = useCurrentSessionTaskSolutions(session.klass.id, session.id, taskId);

  const analyses = useMemo(() => {
    if (!solutions) {
      return [];
    }

    return solutions.map((solution) => {
      const xAxisValue = getAxisAnalysisValue(
        xAxis,
        analyzeAst(solution.generalAst, getAxisAnalysisInput(xAxis)),
      );

      const yAxisValue = getAxisAnalysisValue(
        yAxis,
        analyzeAst(solution.generalAst, getAxisAnalysisInput(yAxis)),
      );

      const matchesAllFilters = filters
        .map((f) =>
          matchesFilter(
            f,
            analyzeAst(solution.generalAst, filterToAnalysisInput(f)),
          ),
        )
        .reduce(
          (matchesAllFilters, matchesFilter) =>
            matchesAllFilters && matchesFilter,
          true,
        );

      const group = groups
        .map((g) =>
          getGroup(g, analyzeAst(solution.generalAst, groupToAnalysisInput(g))),
        )
        .join("-");

      return {
        xAxisValue,
        yAxisValue,
        solution,
        matchesAllFilters,
        group,
      };
    });
  }, [solutions, xAxis, yAxis, filters, groups]);

  return (
    <MultiSwrContent
      data={[solutions]}
      isLoading={[isLoadingSolutions]}
      errors={[solutionsError]}
    >
      {([data]) => <div>{JSON.stringify(analyses)}</div>}
    </MultiSwrContent>
  );
};

export default Analysis;
