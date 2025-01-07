import { useEffect, useState } from "react";
import { ChartSplit } from "../chartjs-plugins/select";
import { AxesCriterionType } from "../axes";
import { Category } from "../category";
import { useAutomaticGrouping } from "./useAutomaticGrouping";
import { useManualGrouping } from "./useManualGrouping";
import {
  CategorizedDataPoint,
  Group,
  ManualGroup,
  FilteredAnalysis,
} from "./types";

export const useGrouping = (
  isAutomaticGrouping: boolean,
  numberOfGroups: number,
  solutions: FilteredAnalysis[],
  splits: ChartSplit[],
  xAxis: AxesCriterionType,
  yAxis: AxesCriterionType,
): {
  isGroupingAvailable: boolean;
  categorizedDataPoints: CategorizedDataPoint[];
  groups: Group[];
  manualGroups: ManualGroup[];
} => {
  const [isGroupingAvailable, setIsGroupingAvailable] =
    useState<boolean>(false);
  const [dataPoints, setDataPoints] = useState<CategorizedDataPoint[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [manualGroups, setManualGroups] = useState<ManualGroup[]>([]);

  const manual = useManualGrouping(
    isAutomaticGrouping,
    solutions,
    splits,
    xAxis,
    yAxis,
  );

  const computeAutomaticGrouping = useAutomaticGrouping(
    isAutomaticGrouping,
    numberOfGroups,
    solutions,
    xAxis,
    yAxis,
  );

  useEffect(() => {
    let isCancelled = false;

    if (!isAutomaticGrouping) {
      const dataPoints = manual.dataPoints;

      setGroups(manual.groups);
      setManualGroups(manual.groups);
      setIsGroupingAvailable(true);
      setDataPoints(dataPoints);
    } else {
      setIsGroupingAvailable(false);

      computeAutomaticGrouping().then((automaticGroups) => {
        if (isCancelled) {
          return;
        }

        const dataPoints = automaticGroups.map((group) => ({
          ...group,
          category: Category.matchesFilters | Category.isAutomaticGroup,
        }));

        setGroups(automaticGroups);
        setManualGroups([]);
        setIsGroupingAvailable(true);
        setDataPoints(dataPoints);
      });
    }

    return (): void => {
      isCancelled = true;
    };
  }, [isAutomaticGrouping, manual, computeAutomaticGrouping]);

  return {
    isGroupingAvailable,
    categorizedDataPoints: dataPoints,
    groups,
    manualGroups,
  };
};
