import { SetStateAction } from "react";
import { AxesCriterionType } from "./axes";
import { FilterCriterion } from "./filter";
import { ChartSplit } from "./chartjs-plugins";

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
  setClickedSolution,
  setBookmarkedSolutions,
  setSelectedSolutions,
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
  type: AnalyzerStateActionType.setClickedSolution;
  selectedSolutionId: { groupKey: string; solutionId: number } | undefined;
}

export interface SetBookmarkedSolutionsAction {
  type: AnalyzerStateActionType.setBookmarkedSolutions;
  bookmarkedSolutionIds: number[];
}

export interface SetSelectedSolutionsAction {
  type: AnalyzerStateActionType.setSelectedSolutions;
  solutionIds: number[];
  unionWithPrevious?: boolean;
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
  | SetBookmarkedSolutionsAction
  | SetSelectedSolutionsAction;

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
  selectedSolutionIds: number[];

  comparison: {
    clickedSolution:
      | {
          groupKey: string;
          solutionId: number;
        }
      | undefined;
    selectedLeftGroup: string;
    selectedRightGroup: string;
    selectedRightSolution: number;
    selectedLeftSolution: number;
  };
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
        comparison: {
          ...state.comparison,
          selectedLeftGroup: action.groupKey,
          selectedLeftSolution: action.solutionId,
        },
      };
    case AnalyzerStateActionType.setSelectedRight:
      return {
        ...state,
        comparison: {
          ...state.comparison,
          selectedRightGroup: action.groupKey,
          selectedRightSolution: action.solutionId,
        },
      };
    case AnalyzerStateActionType.setSelectedLeftGroup:
      return {
        ...state,
        comparison: { ...state.comparison, selectedLeftGroup: action.groupKey },
      };
    case AnalyzerStateActionType.setSelectedRightGroup:
      return {
        ...state,
        comparison: {
          ...state.comparison,
          selectedRightGroup: action.groupKey,
        },
      };
    case AnalyzerStateActionType.setSelectedLeftSolution:
      return {
        ...state,
        comparison: {
          ...state.comparison,
          selectedLeftSolution: action.solutionId,
        },
      };
    case AnalyzerStateActionType.setSelectedRightSolution:
      return {
        ...state,
        comparison: {
          ...state.comparison,
          selectedRightSolution: action.solutionId,
        },
      };
    case AnalyzerStateActionType.setClickedSolution:
      return {
        ...state,
        comparison: {
          ...state.comparison,
          clickedSolution: action.selectedSolutionId,
        },
      };
    case AnalyzerStateActionType.setBookmarkedSolutions:
      return { ...state, bookmarkedSolutionIds: action.bookmarkedSolutionIds };
    case AnalyzerStateActionType.setSelectedSolutions:
      return {
        ...state,
        selectedSolutionIds: action.unionWithPrevious
          ? [...state.selectedSolutionIds, ...action.solutionIds]
          : action.solutionIds,
      };
    default:
      return state;
  }
};
