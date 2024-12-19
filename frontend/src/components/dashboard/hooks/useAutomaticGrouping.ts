import { useCallback } from "react";
import { AxesCriterionType, getAxisAnalysisValue } from "../axes";
import { CurrentAnalysis } from "@/api/collimator/models/solutions/current-analysis";
import { FilterCriterion, matchesFilter } from "../filter";
import { getGroupName } from "./useManualGrouping";
import { mean } from "../criteria/statistics/mean";
import { AutomaticGroup, SolutionGroupAssignment } from "./types";
import { DistanceType } from "./ast-distance/distance-type";
import { getAutomaticGroups } from "./automatic-grouping";
import { AutomaticGroupingType } from "./automatic-grouping/grouping-type";

export const useAutomaticGrouping = (
  isAutomaticGrouping: boolean,
  numberOfGroups: number,
  solutionsInput: CurrentAnalysis[] | undefined,
  filters: FilterCriterion[],
  xAxis: AxesCriterionType,
  yAxis: AxesCriterionType,
): (() => Promise<{
  groupAssignments: SolutionGroupAssignment[];
  automaticGroups: AutomaticGroup[];
}>) =>
  useCallback(async () => {
    const solutions = solutionsInput?.filter((solution) =>
      filters.every((filter) => matchesFilter(filter, solution)),
    );

    if (!solutions || solutions.length === 0 || !isAutomaticGrouping) {
      return { groupAssignments: [], automaticGroups: [] };
    }

    const groups = await getAutomaticGroups(
      solutions,
      numberOfGroups,
      AutomaticGroupingType.agglomerativeClustering,
      DistanceType.pq,
    );

    const groupAssignments: SolutionGroupAssignment[] = [];
    const automaticGroups: AutomaticGroup[] = [];

    for (let i = 0; i < groups.length; i++) {
      const group = groups[i];
      const groupKey = i.toString();
      const label = getGroupName(i);

      const xAxisValues = group.solutions.map((solution) =>
        getAxisAnalysisValue(xAxis, solution),
      );

      const yAxisValues = group.solutions.map((solution) =>
        getAxisAnalysisValue(yAxis, solution),
      );

      automaticGroups.push({
        groupKey,
        groupLabel: label,
        groupName: label,
        x: mean(xAxisValues),
        y: mean(yAxisValues),
        solutions: group.solutions,
      });

      group.solutions.forEach((solution) =>
        groupAssignments.push({
          groupKey,
          solution,
        }),
      );
    }

    return {
      groupAssignments,
      automaticGroups,
    };
  }, [
    isAutomaticGrouping,
    numberOfGroups,
    solutionsInput,
    xAxis,
    yAxis,
    filters,
  ]);
