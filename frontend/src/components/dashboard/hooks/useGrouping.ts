import { useMemo } from "react";
import { AxesCriterionType, getAxisAnalysisValue } from "../axes";
import { CurrentAnalysis } from "@/api/collimator/models/solutions/current-analysis";
import { Category } from "../category";
import { FilterCriterion, matchesFilter } from "../filter";
import { ChartSplit, SplitType } from "../chartjs-plugins/select";

export type AnalyzedSolution = {
  solutionId: number;
  studentPseudonym: string;
  studentKeyPairId: number;

  xAxisValue: number;
  yAxisValue: number;

  category: Category;
  groupKey: string;
};

export type CategoryWithGroups = {
  category: Category;
  solutions: AnalyzedSolution[];
};

export type Group = {
  key: string;
  label: string;

  minX: number;
  maxX: number;

  minY: number;
  maxY: number;
};

const charCodeOfCapitalA = 65;
const numberOfCharacters = 26;

const getGroupName = (idx: number): string => {
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
  group: Omit<Group, "label">,
  x: number,
  y: number,
): boolean =>
  group.minX <= x && x < group.maxX && group.minY <= y && y < group.maxY;

export const useGrouping = (
  solutions: CurrentAnalysis[] | undefined,
  filters: FilterCriterion[],
  splits: ChartSplit[],
  xAxis: AxesCriterionType,
  yAxis: AxesCriterionType,
): {
  categoriesWithGroups: CategoryWithGroups[];
  groups: Group[];
} =>
  useMemo(() => {
    if (!solutions) {
      return {
        categoriesWithGroups: [],
        groups: [],
      };
    }

    const groups: (Omit<Group, "label"> & { label?: string })[] = [];

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
          key: groups.length.toString(),
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

    const solutionsByCategory = solutions
      .map<AnalyzedSolution>((solution) => {
        const xAxisValue = getAxisAnalysisValue(xAxis, solution);
        const yAxisValue = getAxisAnalysisValue(yAxis, solution);

        const matchesAllFilters = filters
          .map((f) => matchesFilter(f, solution))
          .reduce(
            (matchesAllFilters, matchesFilter) =>
              matchesAllFilters && matchesFilter,
            true,
          );

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

        const group = groups.find((g) =>
          isWithinGroup(g, xAxisValue, yAxisValue),
        );

        if (!group) {
          throw new Error(
            "All data points must be within a group - this error should never be thrown",
          );
        }

        if (!group.label) {
          group.label = getGroupName(usedGroupIdx++);
        }

        return {
          solutionId: solution.solutionId,
          studentPseudonym: solution.studentPseudonym,
          studentKeyPairId: solution.studentKeyPairId,
          xAxisValue,
          yAxisValue,
          category,
          groupKey: group.key,
        };
      })
      .reduce((categories, analyzedSolution) => {
        let entry = categories.get(analyzedSolution.category);
        if (!entry) {
          entry = [];
        }

        entry.push(analyzedSolution);
        categories.set(analyzedSolution.category, entry);

        return categories;
      }, new Map<Category, AnalyzedSolution[]>());

    return {
      categoriesWithGroups: [
        ...solutionsByCategory.entries().map(([category, solutions]) => ({
          category: category,
          solutions,
        })),
      ],
      groups: groups.filter((g): g is Group => g.label !== undefined),
    };
  }, [solutions, xAxis, yAxis, filters, splits]);
