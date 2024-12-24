import { SetStateAction } from "react";
import { AxesCriterionType } from "./axes";
import { ChartSplit } from "./chartjs-plugins/select";
import { FilterCriterion } from "./filter";

export const allSubtasks = "__ANALYZE_ALL_SUBTASKS__";
export const defaultGroupValue = "null";
export const defaultSolutionValue = -1;

export enum AnalyzerStateActionType {
  setSelectedTask,
  setSelectedSubTask,
  setFilters,
  setSplits,
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
  setBookmarkedSolutions,
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

export interface SetSplitsAction {
  type: AnalyzerStateActionType.setSplits;
  splits: SetStateAction<ChartSplit[]>;
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

export interface SetBookmarkedSolutionsAction {
  type: AnalyzerStateActionType.setBookmarkedSolutions;
  bookmarkedSolutionIds: number[];
}

export type AnalyzerStateAction =
  | SetSelectedTaskAction
  | SetSelectedSubTaskAction
  | SetFiltersAction
  | SetSplitsAction
  | SetAxisAction
  | SetAutomaticGroupingAction
  | SetNumberOfGroupsAction
  | SetSideAction
  | SetGroupAction
  | SetSolutionAction
  | SetSelectedSolutionAction
  | SetBookmarkedSolutionsAction;

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
    case AnalyzerStateActionType.setSplits:
      return { ...state, splits: getNewState(action.splits, state.splits) };
    case AnalyzerStateActionType.setXAxis:
      return { ...state, xAxis: action.axis };
    case AnalyzerStateActionType.setYAxis:
      return { ...state, yAxis: action.axis };
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
    case AnalyzerStateActionType.setBookmarkedSolutions:
      return { ...state, bookmarkedSolutionIds: action.bookmarkedSolutionIds };
    default:
      return state;
  }
};
