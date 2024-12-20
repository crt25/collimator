import { useMemo } from "react";
import { AxesCriterionType, getAxisAnalysisValue } from "../axes";
import { CurrentAnalysis } from "@/api/collimator/models/solutions/current-analysis";
import { Category } from "../category";
import { ChartSplit, SplitType } from "../chartjs-plugins/select";
import { CategorizedDataPoint, FilteredAnalysis, ManualGroup } from "./types";

class SolutionNotInGroupError extends Error {
  constructor(
    public solution: CurrentAnalysis,
    public xAxis: AxesCriterionType,
    public yAxis: AxesCriterionType,
    public x: number,
    public y: number,
    public groups: Omit<ManualGroup, "groupLabel">[],
  ) {
    super("All data points must be within a group");
  }
}

const charCodeOfCapitalA = 65;
const numberOfCharacters = 26;

export const getCategory = (
  solution: CurrentAnalysis,
  matchesAllFilters: boolean,
): Category => {
  // the differen groups are assigned a category
  // based on global criteria such as whether all filters match
  // or whether a solution passes all tests
  let category = Category.none;

  if (matchesAllFilters) {
    category |= Category.matchesFilters;
  }

  if (solution.totalTests > 0) {
    category |= Category.hasTests;
  }

  if (solution.passedTests > 0) {
    category |= Category.passesSomeTests;
  }

  if (solution.passedTests >= solution.totalTests) {
    category |= Category.passesAllTests;
  }

  return category;
};

export const getGroupName = (idx: number): string => {
  // converts the number to base 26 with 0 = A, 1 = B, ..., 25 = Z, 26 = BA,...
  const name = [];

  do {
    name.push(
      String.fromCharCode(charCodeOfCapitalA + (idx % numberOfCharacters)),
    );

    idx = Math.floor(idx / numberOfCharacters);
  } while (idx > 0);

  return name.reverse().join("");
};

const isWithinGroup = (
  group: Omit<ManualGroup, "groupLabel">,
  x: number,
  y: number,
): boolean =>
  group.minX <= x && x < group.maxX && group.minY <= y && y < group.maxY;

export const useManualGrouping = (
  isAutomaticGrouping: boolean,
  filteredAnalyses: FilteredAnalysis[],
  splits: ChartSplit[],
  xAxis: AxesCriterionType,
  yAxis: AxesCriterionType,
): {
  dataPoints: CategorizedDataPoint[];
  groups: ManualGroup[];
} =>
  useMemo(() => {
    if (isAutomaticGrouping) {
      return {
        dataPoints: [],
        groupAssignment: [],
        groups: [],
      };
    }

    const groups: (Omit<ManualGroup, "groupLabel"> & {
      groupLabel?: string;
    })[] = [];

    const verticalSplits = splits
      .filter((s) => s.type === SplitType.vertical)
      .sort((a, b) => a.x - b.x);
    const horizontalSplits = splits
      .filter((s) => s.type === SplitType.horizontal)
      .sort((a, b) => a.y - b.y);

    let lastX = Number.NEGATIVE_INFINITY;

    for (const vSplit of [
      ...verticalSplits,
      // add an artificial split to include the groups after the last vertical split
      { type: SplitType.vertical, x: Number.POSITIVE_INFINITY },
    ]) {
      let lastY = Number.NEGATIVE_INFINITY;
      for (const hSplit of [
        ...horizontalSplits,
        // add an artificial split to include the groups after the last horizontal split
        {
          type: SplitType.horizontal,
          y: Number.POSITIVE_INFINITY,
        },
      ]) {
        groups.push({
          groupKey: groups.length.toString(),
          minX: lastX,
          maxX: vSplit.x,
          minY: lastY,
          maxY: hSplit.y,
        });

        lastY = hSplit.y;
      }

      lastX = vSplit.x;
    }

    let usedGroupIdx = 0;

    const categorizedDataPoints = filteredAnalyses.map<CategorizedDataPoint>(
      ({ analysis, matchesAllFilters }) => {
        const xAxisValue = getAxisAnalysisValue(xAxis, analysis);
        const yAxisValue = getAxisAnalysisValue(yAxis, analysis);

        const category = getCategory(analysis, matchesAllFilters);

        const group = groups.find((g) =>
          isWithinGroup(g, xAxisValue, yAxisValue),
        );

        if (!group) {
          throw new SolutionNotInGroupError(
            analysis,
            xAxis,
            yAxis,
            xAxisValue,
            yAxisValue,
            groups,
          );
        }

        if (!group.groupLabel) {
          group.groupLabel = getGroupName(usedGroupIdx++);
        }

        return {
          analyses: [analysis],
          x: xAxisValue,
          y: yAxisValue,
          category,
          groupKey: group.groupKey,
          groupName: group.groupLabel,
        };
      },
    );

    return {
      dataPoints: categorizedDataPoints,
      groups: groups.filter(
        (g): g is ManualGroup => g.groupLabel !== undefined,
      ),
    };
  }, [isAutomaticGrouping, filteredAnalyses, xAxis, yAxis, splits]);
