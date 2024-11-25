import { useCurrentSessionTaskSolutions } from "@/api/collimator/hooks/solutions/useCurrentSessionTaskSolutions";
import { ExistingSessionExtended } from "@/api/collimator/models/sessions/existing-session-extended";
import MultiSwrContent from "../MultiSwrContent";
import { AstFilter, filterToAnalysisInput, matchesFilter } from "./filter";
import { AstGroup, getGroup, groupToAnalysisInput } from "./group";
import { useMemo, useState } from "react";
import { analyzeAst, CriterionType } from "@/data-analyzer/analyze-asts";
import {
  AxesCriterionType,
  getAxisAnalysisInput,
  getAxisAnalysisValue,
} from "./axes";

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
