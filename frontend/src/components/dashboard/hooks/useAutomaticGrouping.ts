import { useCallback } from "react";
import { AxesCriterionType, getAxisAnalysisValue } from "../axes";
import { mean } from "../criteria/statistics/mean";
import { getGroupName } from "./useManualGrouping";
import { AutomaticGroup, FilteredAnalysis } from "./types";
import { DistanceType } from "./ast-distance/distance-type";
import { getAutomaticGroups } from "./automatic-grouping";
import { AutomaticGroupingType } from "./automatic-grouping/grouping-type";

export const useAutomaticGrouping = (
  isAutomaticGrouping: boolean,
  numberOfGroups: number,
  filteredAnalyses: FilteredAnalysis[],
  xAxis: AxesCriterionType,
  yAxis: AxesCriterionType,
): (() => Promise<AutomaticGroup[]>) =>
  useCallback(async () => {
    const analyses = filteredAnalyses
      .filter((solution) => solution.matchesAllFilters)
      .map(({ analysis }) => analysis);

    if (analyses.length === 0 || !isAutomaticGrouping) {
      return [];
    }

    const groups = await getAutomaticGroups(
      analyses,
      numberOfGroups,
      AutomaticGroupingType.agglomerativeClustering,
      DistanceType.zhangShasha,
    );

    const automaticGroups: AutomaticGroup[] = [];

    for (let i = 0; i < groups.length; i++) {
      const group = groups[i];
      const groupKey = i.toString();
      const label = getGroupName(i);

      const xAxisValues = group.analyses.map((solution) =>
        getAxisAnalysisValue(xAxis, solution),
      );

      const yAxisValues = group.analyses.map((solution) =>
        getAxisAnalysisValue(yAxis, solution),
      );

      automaticGroups.push({
        groupKey,
        groupLabel: label,
        groupName: label,
        x: mean(xAxisValues),
        y: mean(yAxisValues),
        analyses: group.analyses,
      });
    }

    return automaticGroups;
  }, [isAutomaticGrouping, numberOfGroups, filteredAnalyses, xAxis, yAxis]);
