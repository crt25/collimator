import { useEffect, useState } from "react";
import { useAutomaticGrouping } from "./useAutomaticGrouping";
import { useManualGrouping } from "./useManualGrouping";
import { CurrentAnalysis } from "@/api/collimator/models/solutions/current-analysis";
import { FilterCriterion } from "../filter";
import { ChartSplit } from "../chartjs-plugins/select";
import { AxesCriterionType } from "../axes";
import {
  CategorizedDataPoints,
  Group,
  ManualGroup,
  SolutionGroupAssignment,
} from "./grouping";
import { Category } from "../category";

export const useGrouping = (
  isAutomaticGrouping: boolean,
  numberOfGroups: number,
  solutions: CurrentAnalysis[] | undefined,
  filters: FilterCriterion[],
  splits: ChartSplit[],
  xAxis: AxesCriterionType,
  yAxis: AxesCriterionType,
): {
  categorizedDataPoints: CategorizedDataPoints[];
  groupAssignments: SolutionGroupAssignment[];
  groups: Group[];
  manualGroups: ManualGroup[];
} => {
  const [dataPoints, setDataPoints] = useState<CategorizedDataPoints[]>([]);
  const [groupAssignment, setGroupAssignment] = useState<
    SolutionGroupAssignment[]
  >([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [manualGroups, setManualGroups] = useState<ManualGroup[]>([]);

  const manual = useManualGrouping(
    isAutomaticGrouping,
    solutions,
    filters,
    splits,
    xAxis,
    yAxis,
  );

  const computeAutomaticGrouping = useAutomaticGrouping(
    isAutomaticGrouping,
    numberOfGroups,
    solutions,
    filters,
    xAxis,
    yAxis,
  );

  useEffect(() => {
    let isCancelled = false;
    if (isAutomaticGrouping) {
      computeAutomaticGrouping().then(
        ({ automaticGroups, groupAssignments }) => {
          if (isCancelled) {
            return;
          }

          console.log("done", automaticGroups);

          setDataPoints([
            {
              category: Category.matchesFilters | Category.isAutomaticGroup,
              dataPoints: automaticGroups,
            },
          ]);
          setGroupAssignment(groupAssignments);
          setGroups(automaticGroups);
          setManualGroups([]);
        },
      );
    } else {
      setDataPoints(manual.dataPoints);
      setGroupAssignment(manual.groupAssignment);
      setGroups(manual.groups);
      setManualGroups(manual.groups);
    }

    return (): void => {
      isCancelled = true;
    };
  }, [isAutomaticGrouping, manual, computeAutomaticGrouping]);

  return {
    categorizedDataPoints: dataPoints,
    groupAssignments: groupAssignment,
    groups: groups,
    manualGroups: manualGroups,
  };
};
