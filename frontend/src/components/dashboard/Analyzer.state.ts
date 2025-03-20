import { SetStateAction } from "react";
import { AxesCriterionType } from "./axes";
import { FilterCriterion } from "./filter";
import { ChartSplit, SplitType } from "./chartjs-plugins";

export const allSubtasks = "__ANALYZE_ALL_SUBTASKS__";
export const defaultGroupValue = "__ALL_STUDENTS__";
export const selectedGroupValue = "__SELECTED_SOLUTIONS__";
export const defaultSourceValue = "";

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
  setSelectedLeftAnalysis,
  setSelectedRightAnalysis,
  setClickedAnalysis,
  setSelectedAnalyses,
  addBookmarkedAnalysis,
  removeBookmarkedAnalysis,
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
  sourceId: string;
}

export interface SetGroupAction {
  type:
    | AnalyzerStateActionType.setSelectedLeftGroup
    | AnalyzerStateActionType.setSelectedRightGroup;
  groupKey: string;
}

export interface SetAnalysisAction {
  type:
    | AnalyzerStateActionType.setSelectedLeftAnalysis
    | AnalyzerStateActionType.setSelectedRightAnalysis;
  sourceId: string;
}

export interface SetClickedAnalysisAction {
  type: AnalyzerStateActionType.setClickedAnalysis;
  clickedAnalysis: { groupKey: string; sourceId: string } | undefined;
}

export interface AddBookmarkedAnalysisAction {
  type: AnalyzerStateActionType.addBookmarkedAnalysis;
  sourceId: string;
}

export interface RemoveBookmarkedAnalysisAction {
  type: AnalyzerStateActionType.removeBookmarkedAnalysis;
  sourceId: string;
}

export interface SetSelectedAnalysesAction {
  type: AnalyzerStateActionType.setSelectedAnalyses;
  sourceIds: string[];
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
  | SetNumberOfGroupsAction
  | SetSideAction
  | SetGroupAction
  | SetAnalysisAction
  | SetClickedAnalysisAction
  | SetSelectedAnalysesAction
  | AddBookmarkedAnalysisAction
  | RemoveBookmarkedAnalysisAction;

export interface AnalyzerState {
  selectedTask: number | undefined;
  selectedSubTaskId: string | undefined;
  isAutomaticGrouping: boolean;
  numberOfGroups: number;
  xAxis: AxesCriterionType;
  yAxis: AxesCriterionType;
  filters: FilterCriterion[];
  splits: ChartSplit[];
  bookmarkedSourceIds: Set<string>;
  selectedSourceIds: Set<string>;

  comparison: {
    clickedAnalysis:
      | {
          groupKey: string;
          sourceId: string;
        }
      | undefined;
    selectedLeftGroup: string;
    selectedRightGroup: string;
    selectedRightSourceId: string;
    selectedLeftSourceId: string;
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
    case AnalyzerStateActionType.setNumberOfGroups:
      return { ...state, numberOfGroups: action.numberOfGroups };
    case AnalyzerStateActionType.setSelectedLeft:
      return {
        ...state,
        comparison: {
          ...state.comparison,
          selectedLeftGroup: action.groupKey,
          selectedLeftSourceId: action.sourceId,
        },
      };
    case AnalyzerStateActionType.setSelectedRight:
      return {
        ...state,
        comparison: {
          ...state.comparison,
          selectedRightGroup: action.groupKey,
          selectedRightSourceId: action.sourceId,
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
    case AnalyzerStateActionType.setSelectedLeftAnalysis:
      return {
        ...state,
        comparison: {
          ...state.comparison,
          selectedLeftSourceId: action.sourceId,
        },
      };
    case AnalyzerStateActionType.setSelectedRightAnalysis:
      return {
        ...state,
        comparison: {
          ...state.comparison,
          selectedRightSourceId: action.sourceId,
        },
      };
    case AnalyzerStateActionType.setClickedAnalysis:
      return {
        ...state,
        comparison: {
          ...state.comparison,
          clickedAnalysis: action.clickedAnalysis,
        },
      };
    case AnalyzerStateActionType.addBookmarkedAnalysis:
      return {
        ...state,
        bookmarkedSourceIds: state.bookmarkedSourceIds.union(
          new Set<string>([action.sourceId]),
        ),
      };
    case AnalyzerStateActionType.removeBookmarkedAnalysis:
      return {
        ...state,
        bookmarkedSourceIds: state.bookmarkedSourceIds.difference(
          new Set<string>([action.sourceId]),
        ),
      };
    case AnalyzerStateActionType.setSelectedAnalyses:
      const newSelection = new Set<string>(action.sourceIds);

      return {
        ...state,
        selectedSourceIds: action.unionWithPrevious
          ? state.selectedSourceIds.union(newSelection)
          : newSelection,
      };
    default:
      return state;
  }
};
