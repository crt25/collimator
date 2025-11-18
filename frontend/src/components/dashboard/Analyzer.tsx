import { useCallback, useMemo, useReducer } from "react";
import { defineMessages, FormattedMessage, useIntl } from "react-intl";
import { Dialog, Grid, GridItem, Portal } from "@chakra-ui/react";
import { ExistingSessionExtended } from "@/api/collimator/models/sessions/existing-session-extended";
import { useCurrentSessionTaskSolutions } from "@/api/collimator/hooks/solutions/useCurrentSessionTaskSolutions";
import { AstCriterionType } from "@/data-analyzer/analyze-asts";
import { CurrentAnalysis } from "@/api/collimator/models/solutions/current-analysis";
import { ExistingTask } from "@/api/collimator/models/tasks/existing-task";
import MultiSwrContent from "../MultiSwrContent";
import Select from "../form/Select";
import Button from "../Button";
import Checkbox from "../form/Checkbox";
import { MetaCriterionType } from "./criteria/meta-criterion-type";
import AnalyzerFilterForm from "./filter/AnalyzerFilterForm";
import {
  FilterCriterionParameters,
  FilterCriterionType,
  runFilter,
} from "./filter";
import { useGrouping } from "./hooks/useGrouping";
import Analysis from "./Analysis";
import CodeComparison from "./CodeComparison";
import { FilteredAnalysis } from "./hooks/types";
import {
  AnalyzerState,
  AnalyzerStateActionType,
  analyzerStateReducer,
  defaultGroupValue,
  defaultSolutionIdValue,
} from "./Analyzer.state";
import AnalysisParameters from "./AnalysisParameters";
import { useSubtasks } from "./hooks/useSubtasks";
import { useSubtaskAnalyses } from "./hooks/useSubtaskAnalyses";

const messages = defineMessages({
  subTaskSelection: {
    id: "Analyzer.subTaskSelection",
    defaultMessage: "Sub-task Selection",
  },
  allSubTasks: {
    id: "Analyzer.allSubTasks",
    defaultMessage: "All sub-tasks",
  },
  automaticGrouping: {
    id: "Analyzer.automaticGrouping",
    defaultMessage: "Automatic Grouping",
  },
  numberOfGroups: {
    id: "Analyzer.numberOfGroups",
    defaultMessage: "Number of groups",
  },
  selectSolutionForComparisonTitle: {
    id: "Analyzer.selectSolutionForComparisonTitle",
    defaultMessage: "Selecting Solution for Comparison",
  },
  selectSolutionForComparisonDescription: {
    id: "Analyzer.selectSolutionForComparisonDescription",
    defaultMessage: "Where should the selected solution be placed?",
  },
  selectSolutionForComparisonLeft: {
    id: "Analyzer.selectSolutionForComparisonLeft",
    defaultMessage: "Left",
  },
  selectSolutionForComparisonRight: {
    id: "Analyzer.selectSolutionForComparisonRight",
    defaultMessage: "Right",
  },
});

const Analyzer = ({
  session,
  task,
}: {
  session: ExistingSessionExtended;
  task: ExistingTask;
}) => {
  const intl = useIntl();

  const [state, dispatch] = useReducer(analyzerStateReducer, {
    selectedTask: session.tasks[0]?.id,
    selectedSubTaskId: undefined,
    isAutomaticGrouping: false,
    xAxis: AstCriterionType.statement,
    yAxis: MetaCriterionType.test,
    filters: [],
    splits: [],
    selectedSolutionIds: new Set<string>(),
    comparison: {
      clickedAnalysis: undefined,
      selectedLeftGroup: defaultGroupValue,
      selectedRightGroup: defaultGroupValue,
      selectedRightSolutionId: defaultSolutionIdValue,
      selectedLeftSolutionId: defaultSolutionIdValue,
    },
  } satisfies AnalyzerState);

  const {
    data: analyses,
    isLoading: isLoadingAnalyses,
    error: analysesErrors,
  } = useCurrentSessionTaskSolutions(
    session.klass.id,
    session.id,
    state.selectedTask,
  );

  const subtasks = useSubtasks(analyses);
  const subTaskAnalyses = useSubtaskAnalyses(analyses, state.selectedSubTaskId);

  const { filteredAnalyses, parametersByCriterion } = useMemo<{
    filteredAnalyses: FilteredAnalysis[];
    parametersByCriterion: {
      [key in FilterCriterionType]?: FilterCriterionParameters;
    };
  }>(() => {
    if (!subTaskAnalyses) {
      return {
        filteredAnalyses: [],
        parametersByCriterion: {},
      };
    }

    const matchesAllFilters = new Array<boolean>(subTaskAnalyses?.length).fill(
      true,
    );

    const parametersByCriterion: {
      [key in FilterCriterionType]?: FilterCriterionParameters;
    } = {};

    for (const f of state.filters) {
      const result = runFilter(f, subTaskAnalyses);
      result.matchesFilter.forEach((m, idx) => {
        matchesAllFilters[idx] = matchesAllFilters[idx] && m;
      });

      parametersByCriterion[f.criterion] = result.parameters;
    }

    const filteredAnalyses = subTaskAnalyses?.map((analysis, idx) => ({
      analysis,
      matchesAllFilters: matchesAllFilters[idx],
    }));

    return {
      filteredAnalyses,
      parametersByCriterion,
    };
  }, [subTaskAnalyses, state.filters]);

  const { isGroupingAvailable, categorizedDataPoints, groups, manualGroups } =
    useGrouping(
      state.isAutomaticGrouping,
      filteredAnalyses,
      state.splits,
      state.xAxis,
      state.yAxis,
    );

  const onSelectSolution = useCallback(
    (groupKey: string, { solutionId }: CurrentAnalysis) => {
      if (state.comparison.selectedLeftSolutionId === defaultSolutionIdValue) {
        dispatch({
          type: AnalyzerStateActionType.setSelectedLeft,
          groupKey,
          solutionId,
        });
      } else if (
        state.comparison.selectedRightSolutionId === defaultSolutionIdValue
      ) {
        dispatch({
          type: AnalyzerStateActionType.setSelectedRight,
          groupKey,
          solutionId,
        });
      } else {
        // let the user choose
        dispatch({
          type: AnalyzerStateActionType.setClickedAnalysis,
          clickedAnalysis: { groupKey, solutionId: solutionId },
        });
      }
    },
    [
      state.comparison.selectedLeftSolutionId,
      state.comparison.selectedRightSolutionId,
    ],
  );

  if (!state.selectedTask) {
    return (
      <FormattedMessage
        id="Analyzer.noTasksInSession"
        defaultMessage="There are no tasks in this session."
      />
    );
  }

  return (
    <>
      <MultiSwrContent
        data={[analyses]}
        isLoading={[isLoadingAnalyses]}
        errors={[analysesErrors]}
      >
        {([_analyses]) => (
          <Grid templateColumns="repeat(12, 1fr)" gap={4}>
            <GridItem colSpan={{ base: 12, lg: 3 }}>
              <AnalysisParameters>
                <Select
                  label={messages.subTaskSelection}
                  placeholder={messages.allSubTasks}
                  options={subtasks.map((subtask) => ({
                    label: subtask.toString(),
                    value: subtask,
                  }))}
                  data-testid="select-subtask"
                  onValueChange={(value) =>
                    dispatch({
                      type: AnalyzerStateActionType.setSelectedSubTask,
                      selectedSubTaskId: value,
                    })
                  }
                  value={state.selectedSubTaskId}
                  alwaysShow
                />

                <AnalyzerFilterForm
                  taskType={task.type}
                  filters={state.filters}
                  setFilters={(filters) =>
                    dispatch({
                      type: AnalyzerStateActionType.setFilters,
                      filters,
                    })
                  }
                  parametersByCriterion={parametersByCriterion}
                />

                <Checkbox
                  label={messages.automaticGrouping}
                  checked={state.isAutomaticGrouping}
                  onCheckedChange={(checked) =>
                    dispatch({
                      type: AnalyzerStateActionType.setAutomaticGrouping,
                      isAutomaticGrouping: checked,
                    })
                  }
                />

                {!isGroupingAvailable && (
                  <FormattedMessage
                    id="Analyzer.noGroupingAvailable"
                    defaultMessage="Computing groups, please be patient."
                  />
                )}
              </AnalysisParameters>
            </GridItem>
            <GridItem colSpan={{ base: 12, lg: 9 }}>
              <Analysis
                taskType={task.type}
                state={state}
                dispatch={dispatch}
                categorizedDataPoints={categorizedDataPoints}
                manualGroups={manualGroups}
                onSelectAnalysis={onSelectSolution}
              />
            </GridItem>
            <GridItem colSpan={{ base: 12 }}>
              {task && (
                <CodeComparison
                  classId={session.klass.id}
                  sessionId={session.id}
                  taskId={task.id}
                  state={state}
                  dispatch={dispatch}
                  taskType={task.type}
                  categorizedDataPoints={categorizedDataPoints}
                  groups={groups}
                />
              )}
            </GridItem>
          </Grid>
        )}
      </MultiSwrContent>
      <Dialog.Root
        open={state.comparison.clickedAnalysis !== undefined}
        onOpenChange={() =>
          dispatch({
            type: AnalyzerStateActionType.setClickedAnalysis,
            clickedAnalysis: undefined,
          })
        }
        data-testid="solution-selection-modal"
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>
                  {intl.formatMessage(
                    messages.selectSolutionForComparisonTitle,
                  )}
                </Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                {intl.formatMessage(
                  messages.selectSolutionForComparisonDescription,
                )}
              </Dialog.Body>
              <Dialog.Footer>
                <Button
                  onClick={() => {
                    if (state.comparison.clickedAnalysis) {
                      dispatch({
                        type: AnalyzerStateActionType.setSelectedLeft,
                        groupKey: state.comparison.clickedAnalysis.groupKey,
                        solutionId: state.comparison.clickedAnalysis.solutionId,
                      });

                      dispatch({
                        type: AnalyzerStateActionType.setClickedAnalysis,
                        clickedAnalysis: undefined,
                      });
                    }
                  }}
                  variant="primary"
                  data-testid="cancel-button"
                >
                  {intl.formatMessage(messages.selectSolutionForComparisonLeft)}
                </Button>
                <Button
                  onClick={() => {
                    if (state.comparison.clickedAnalysis) {
                      dispatch({
                        type: AnalyzerStateActionType.setSelectedRight,
                        groupKey: state.comparison.clickedAnalysis.groupKey,
                        solutionId: state.comparison.clickedAnalysis.solutionId,
                      });

                      dispatch({
                        type: AnalyzerStateActionType.setClickedAnalysis,
                        clickedAnalysis: undefined,
                      });
                    }
                  }}
                  variant="primary"
                  data-testid="cancel-button"
                >
                  {intl.formatMessage(
                    messages.selectSolutionForComparisonRight,
                  )}
                </Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </>
  );
};

export default Analyzer;
