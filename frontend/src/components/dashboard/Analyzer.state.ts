import { SetStateAction } from "react";
import { AxesCriterionType } from "./axes";
import { ChartSplit, SplitType } from "./chartjs-plugins/select";
import { FilterCriterion } from "./filter";

export const allSubtasks = "__ANALYZE_ALL_SUBTASKS__";
export const defaultGroupValue = "null";
export const defaultSolutionValue = -1;

export enum AnalyzerStateActionType {
  setSelectedTask,
  setSelectedSubTask,
  setFilters,
  addSplit,
  removeSplit,
  setXAxis,
  setYAxis,
  setAutomaticGrouping,
  setNumberOfGroups,
  setSelectedLeft,
  setSelectedRight,
  setSelectedLeftGroup,
  setSelectedRightGroup,
  setSelectedLeftSolution,
  setSelectedRightSolution,
  setSelectedSolution,
  addBookmarkedSolution,
  removeBookmarkedSolution,
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

export interface SetNumberOfGroupsAction {
  type: AnalyzerStateActionType.setNumberOfGroups;
  numberOfGroups: number;
}

export interface SetSideAction {
  type:
    | AnalyzerStateActionType.setSelectedLeft
    | AnalyzerStateActionType.setSelectedRight;
  groupKey: string;
  solutionId: number;
}

export interface SetGroupAction {
  type:
    | AnalyzerStateActionType.setSelectedLeftGroup
    | AnalyzerStateActionType.setSelectedRightGroup;
  groupKey: string;
}

export interface SetSolutionAction {
  type:
    | AnalyzerStateActionType.setSelectedLeftSolution
    | AnalyzerStateActionType.setSelectedRightSolution;
  solutionId: number;
}

export interface SetSelectedSolutionAction {
  type: AnalyzerStateActionType.setSelectedSolution;
  selectedSolutionId: { groupKey: string; solutionId: number } | undefined;
}

export interface AddBookmarkedSolutionsAction {
  type: AnalyzerStateActionType.addBookmarkedSolution;
  solutionId: number;
}

export interface RemoveBookmarkedSolutionsAction {
  type: AnalyzerStateActionType.removeBookmarkedSolution;
  solutionId: number;
}

export type AnalyzerStateAction =
  | SetSelectedTaskAction
  | SetSelectedSubTaskAction
  | SetFiltersAction
  | AddSplitAction
  | RemoveSplitAction
  | SetAxisAction
  | SetAutomaticGroupingAction
  | SetNumberOfGroupsAction
  | SetSideAction
  | SetGroupAction
  | SetSolutionAction
  | SetSelectedSolutionAction
  | AddBookmarkedSolutionsAction
  | RemoveBookmarkedSolutionsAction;

export interface AnalyzerState {
  selectedTask: number | undefined;
  selectedSubTaskId: string | undefined;
  isAutomaticGrouping: boolean;
  numberOfGroups: number;
  xAxis: AxesCriterionType;
  yAxis: AxesCriterionType;
  filters: FilterCriterion[];
  splits: ChartSplit[];
  bookmarkedSolutionIds: number[];
  selectedSolutionId:
    | {
        groupKey: string;
        solutionId: number;
      }
    | undefined;
  selectedLeftGroup: string;
  selectedRightGroup: string;
  selectedRightSolution: number;
  selectedLeftSolution: number;
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
    case AnalyzerStateActionType.setNumberOfGroups:
      return { ...state, numberOfGroups: action.numberOfGroups };
    case AnalyzerStateActionType.setSelectedLeft:
      return {
        ...state,
        selectedLeftGroup: action.groupKey,
        selectedLeftSolution: action.solutionId,
      };
    case AnalyzerStateActionType.setSelectedRight:
      return {
        ...state,
        selectedRightGroup: action.groupKey,
        selectedRightSolution: action.solutionId,
      };
    case AnalyzerStateActionType.setSelectedLeftGroup:
      return { ...state, selectedLeftGroup: action.groupKey };
    case AnalyzerStateActionType.setSelectedRightGroup:
      return { ...state, selectedRightGroup: action.groupKey };
    case AnalyzerStateActionType.setSelectedLeftSolution:
      return { ...state, selectedLeftSolution: action.solutionId };
    case AnalyzerStateActionType.setSelectedRightSolution:
      return { ...state, selectedRightSolution: action.solutionId };
    case AnalyzerStateActionType.setSelectedSolution:
      return { ...state, selectedSolutionId: action.selectedSolutionId };
    case AnalyzerStateActionType.addBookmarkedSolution:
      return {
        ...state,
        bookmarkedSolutionIds: [
          ...state.bookmarkedSolutionIds,
          action.solutionId,
        ],
      };
    case AnalyzerStateActionType.removeBookmarkedSolution:
      return {
        ...state,
        bookmarkedSolutionIds: state.bookmarkedSolutionIds.filter(
          (id) => id !== action.solutionId,
        ),
      };
    default:
      return state;
  }
};
