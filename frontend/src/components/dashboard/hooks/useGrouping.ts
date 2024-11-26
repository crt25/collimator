import { useMemo } from "react";
import { AxesCriterionType, getAxisAnalysisValue } from "../axes";
import { CurrentAnalysis } from "@/api/collimator/models/solutions/current-analysis";
import { SuperGroup } from "../super-group";
import { AstGroup, getGroup } from "../group";
import { AstFilter, matchesFilter } from "../filter";
import { mean } from "../statistics";

export type AnalyzedSolution = {
  solutionId: number;
  studentPseudonym: string;
  xAxisValue: number;
  yAxisValue: number;
  superGroup: SuperGroup;
  group: string;
};

export type AnalyzedGroup = {
  name: string;
  meanX: number;
  meanY: number;
  solutions: {
    id: number;
    studentPseudonym: string;
  }[];
  superGroup: SuperGroup;
};

export type AnalyzedSuperGroup = {
  superGroup: SuperGroup;
  groups: AnalyzedGroup[];
};

export const useGrouping = (
  solutions: CurrentAnalysis[] | undefined,
  filters: AstFilter[],
  groups: AstGroup[],
  xAxis: AxesCriterionType,
  yAxis: AxesCriterionType,
): AnalyzedSuperGroup[] =>
  useMemo(() => {
    if (!solutions) {
      return [];
    }

    const solutionsByGroup = solutions
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

        // the differen groups are again grouped into super groups
        // based on global criteria such as whether all filters match
        // or whether a solution passes all tests
        let superGroup = SuperGroup.none;

        if (matchesAllFilters) {
          superGroup |= SuperGroup.matches;
        }

        const assignedGroups =
          groups.length > 0
            ? groups.map((g) => getGroup(g, solution))
            : // if no groups are defined, all solutions are in a different group
              solution.id.toString();

        const group = [
          // always include the super groups because those group the groups
          // and hence if solutions are not in the same super group they cannot be in the same group
          superGroup.toString(),
          ...assignedGroups,
        ].join("-");

        return {
          solutionId: solution.solutionId,
          studentPseudonym: solution.studentPseudonym,
          xAxisValue,
          yAxisValue,
          superGroup,
          group,
        };
      })
      .reduce(
        (groups, analyzedSolution) => {
          if (!groups[analyzedSolution.group]) {
            groups[analyzedSolution.group] = [];
          }

          groups[analyzedSolution.group].push(analyzedSolution);

          return groups;
        },
        {} as { [key: string]: AnalyzedSolution[] },
      );

    let idx = 0;

    const groupsBySuperGroup = Object.values(solutionsByGroup)
      .map<Omit<AnalyzedGroup, "name">>((solutions) => {
        const meanX = mean(solutions.map((s) => s.xAxisValue));
        const meanY = mean(solutions.map((s) => s.yAxisValue));
        const superGroup = solutions[0].superGroup;

        if (solutions.some((s) => s.superGroup !== superGroup)) {
          throw new Error(
            "Solutions in the same group must have the same super group",
          );
        }

        return {
          meanX,
          meanY,
          solutions: solutions.map((s) => ({
            id: s.solutionId,
            studentPseudonym: s.studentPseudonym,
          })),
          superGroup,
        };
      })
      .reduce(
        (superGroups, analyzedGroup) => {
          if (!superGroups[analyzedGroup.superGroup]) {
            superGroups[analyzedGroup.superGroup] = {
              idx: idx++,
              superGroup: analyzedGroup.superGroup,
              groups: [],
            };
          }

          superGroups[analyzedGroup.superGroup].groups.push({
            ...analyzedGroup,
            name: `Group ${superGroups[analyzedGroup.superGroup].idx}.${superGroups[analyzedGroup.superGroup].groups.length}`,
          });

          return superGroups;
        },
        {} as { [key: number]: AnalyzedSuperGroup & { idx: number } },
      );

    return Object.values(groupsBySuperGroup).toSorted((a, b) => a.idx - b.idx);
  }, [solutions, xAxis, yAxis, filters, groups]);
