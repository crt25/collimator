import { SetStateAction } from "react";
import { AxesCriterionType } from "./axes";
import { FilterCriterion } from "./filter";
import { ChartSplit, SplitType } from "./chartjs-plugins";

export enum AnalyzerStateActionType {
  setSelectedTask,
  setSelectedSubTask,
  setFilters,
  addSplit,
  removeSplit,
  setXAxis,
  setYAxis,
  setAutomaticGrouping,
  setAnalysesSelectedForComparison,
  setSelectedAnalyses,
}

export interface SetSelectedTaskAction {
  type: AnalyzerStateActionType.setSelectedTask;
  selectedTaskId: number;
}

export interface SetSelectedSubTaskAction {
  type: AnalyzerStateActionType.setSelectedSubTask;
  selectedSubTaskId: string | undefined;
}

export interface SetFiltersAction {
  type: AnalyzerStateActionType.setFilters;
  filters: SetStateAction<FilterCriterion[]>;
}

export interface AddSplitAction {
  type: AnalyzerStateActionType.addSplit;
  split: ChartSplit;
}

export interface RemoveSplitAction {
  type: AnalyzerStateActionType.removeSplit;
  split: ChartSplit;
}

export interface SetAxisAction {
  type: AnalyzerStateActionType.setXAxis | AnalyzerStateActionType.setYAxis;
  axis: AxesCriterionType;
}

export interface SetAutomaticGroupingAction {
  type: AnalyzerStateActionType.setAutomaticGrouping;
  isAutomaticGrouping: boolean;
}

export interface SetAnalysesSelectedForComparisonAction {
  type: AnalyzerStateActionType.setAnalysesSelectedForComparison;
  solutionIds: string[];
  unionWithPrevious?: boolean;
}

export interface SetSelectedAnalysesAction {
  type: AnalyzerStateActionType.setSelectedAnalyses;
  solutionId: string[];
  unionWithPrevious?: boolean;
}

export type AnalyzerStateAction =
  | SetSelectedTaskAction
  | SetSelectedSubTaskAction
  | SetFiltersAction
  | AddSplitAction
  | RemoveSplitAction
  | SetAxisAction
  | SetAutomaticGroupingAction
  | SetAnalysesSelectedForComparisonAction
  | SetSelectedAnalysesAction;

export interface AnalyzerState {
  selectedTask: number | undefined;
  selectedSubTaskId: string | undefined;
  isAutomaticGrouping: boolean;
  xAxis: AxesCriterionType;
  yAxis: AxesCriterionType;
  filters: FilterCriterion[];
  splits: ChartSplit[];
  selectedSolutionIds: Set<string>;
  comparison: {
    selectedSolutionIds: Set<string>;
  };
}

const getNewState = <T>(setState: SetStateAction<T>, oldState: T): T =>
  typeof setState === "function"
    ? (setState as (state: T) => T)(oldState)
    : setState;

const setAxis = (
  state: AnalyzerState,
  axisDimension: "x" | "y",
  newAxis: AxesCriterionType,
): AnalyzerState => {
  let newSplits: ChartSplit[] = [];

  const otherAxis = axisDimension === "x" ? state.yAxis : state.xAxis;
  let newOtherAxis = otherAxis;

  if (otherAxis === newAxis) {
    // flip axes
    newOtherAxis = axisDimension === "x" ? state.xAxis : state.yAxis;

    // when flipping axes, keep the splits
    newSplits = state.splits.map((split) =>
      split.type === SplitType.horizontal
        ? {
            type: SplitType.vertical,
            x: split.y,
          }
        : {
            type: SplitType.horizontal,
            y: split.x,
          },
    );
  }

  const xAxis = axisDimension === "x" ? newAxis : newOtherAxis;
  const yAxis = axisDimension === "y" ? newAxis : newOtherAxis;

  return {
    ...state,
    xAxis,
    yAxis,
    splits: newSplits,
  };
};

export const analyzerStateReducer = (
  state: AnalyzerState,
  action: AnalyzerStateAction,
): AnalyzerState => {
  switch (action.type) {
    case AnalyzerStateActionType.setSelectedTask:
      return { ...state, selectedTask: action.selectedTaskId };
    case AnalyzerStateActionType.setSelectedSubTask:
      return { ...state, selectedSubTaskId: action.selectedSubTaskId };
    case AnalyzerStateActionType.setFilters:
      return { ...state, filters: getNewState(action.filters, state.filters) };
    case AnalyzerStateActionType.addSplit:
      return { ...state, splits: [...state.splits, action.split] };
    case AnalyzerStateActionType.removeSplit:
      return {
        ...state,
        splits: state.splits.filter((split) => split !== action.split),
      };
    case AnalyzerStateActionType.setXAxis:
      return setAxis(state, "x", action.axis);
    case AnalyzerStateActionType.setYAxis:
      return setAxis(state, "y", action.axis);
    case AnalyzerStateActionType.setAutomaticGrouping:
      return { ...state, isAutomaticGrouping: action.isAutomaticGrouping };
    case AnalyzerStateActionType.setAnalysesSelectedForComparison: {
      const newSelection = new Set<string>(action.solutionIds);

      return {
        ...state,
        comparison: {
          selectedSolutionIds: action.unionWithPrevious
            ? state.comparison.selectedSolutionIds.union(newSelection)
            : newSelection,
        },
      };
    }
    case AnalyzerStateActionType.setSelectedAnalyses: {
      const newSelection = new Set<string>(action.solutionId);

      return {
        ...state,
        selectedSolutionIds: action.unionWithPrevious
          ? state.selectedSolutionIds.union(newSelection)
          : newSelection,
      };
    }
    default:
      return state;
  }
};
