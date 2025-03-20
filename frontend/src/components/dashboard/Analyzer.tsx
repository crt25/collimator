import { useCallback, useMemo, useReducer } from "react";
import { defineMessages, FormattedMessage, useIntl } from "react-intl";
import { Col, Modal, Row } from "react-bootstrap";
import { ExistingSessionExtended } from "@/api/collimator/models/sessions/existing-session-extended";
import { useCurrentSessionTaskSolutions } from "@/api/collimator/hooks/solutions/useCurrentSessionTaskSolutions";
import { useTask } from "@/api/collimator/hooks/tasks/useTask";
import { AstCriterionType } from "@/data-analyzer/analyze-asts";
import { CurrentAnalysis } from "@/api/collimator/models/solutions/current-analysis";
import MultiSwrContent from "../MultiSwrContent";
import Select from "../form/Select";
import Input from "../form/Input";
import Button, { ButtonVariant } from "../Button";
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
  allSubtasks,
  AnalyzerState,
  AnalyzerStateActionType,
  analyzerStateReducer,
  defaultGroupValue,
  defaultSourceValue,
} from "./Analyzer.state";
import AnalysisParameters from "./AnalysisParameters";
import { useSubtasks } from "./hooks/useSubtasks";
import { useSubtaskAnalyses } from "./hooks/useSubtaskAnalyses";

const messages = defineMessages({
  taskSelection: {
    id: "Analyzer.taskSelection",
    defaultMessage: "Task Selection",
  },
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

const Analyzer = ({ session }: { session: ExistingSessionExtended }) => {
  const intl = useIntl();

  const [state, dispatch] = useReducer(analyzerStateReducer, {
    selectedTask: session.tasks[0]?.id,
    selectedSubTaskId: undefined,
    isAutomaticGrouping: false,
    numberOfGroups: 3,
    xAxis: AstCriterionType.statement,
    yAxis: MetaCriterionType.test,
    filters: [],
    splits: [],
    bookmarkedSourceIds: new Set<string>(),
    selectedSourceIds: new Set<string>(),
    comparison: {
      clickedAnalysis: undefined,
      selectedLeftGroup: defaultGroupValue,
      selectedRightGroup: defaultGroupValue,
      selectedRightSourceId: defaultSourceValue,
      selectedLeftSourceId: defaultSourceValue,
    },
  } satisfies AnalyzerState);

  const {
    data: task,
    isLoading: isLoadingTask,
    error: taskError,
  } = useTask(state.selectedTask);

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
      state.numberOfGroups,
      filteredAnalyses,
      state.splits,
      state.xAxis,
      state.yAxis,
    );

  const onSelectSolution = useCallback(
    (groupKey: string, { sourceId }: CurrentAnalysis) => {
      if (state.comparison.selectedLeftSourceId === defaultSourceValue) {
        dispatch({
          type: AnalyzerStateActionType.setSelectedLeft,
          groupKey,
          sourceId,
        });
      } else if (
        state.comparison.selectedRightSourceId === defaultSourceValue
      ) {
        dispatch({
          type: AnalyzerStateActionType.setSelectedRight,
          groupKey,
          sourceId,
        });
      } else {
        // let the user choose
        dispatch({
          type: AnalyzerStateActionType.setClickedAnalysis,
          clickedAnalysis: { groupKey, sourceId },
        });
      }
    },
    [
      state.comparison.selectedLeftSourceId,
      state.comparison.selectedRightSourceId,
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
        data={[task, analyses]}
        isLoading={[isLoadingTask, isLoadingAnalyses]}
        errors={[taskError, analysesErrors]}
      >
        {([task]) => (
          <Row>
            <Col xs={12} lg={3}>
              <AnalysisParameters>
                <Select
                  label={messages.taskSelection}
                  options={session.tasks.map((task) => ({
                    label: task.title,
                    value: task.id,
                  }))}
                  data-testid="select-task"
                  onChange={(e) =>
                    dispatch({
                      type: AnalyzerStateActionType.setSelectedTask,
                      selectedTaskId: parseInt(e.target.value),
                    })
                  }
                  value={state.selectedTask}
                  alwaysShow
                />

                <Select
                  label={messages.subTaskSelection}
                  options={[
                    {
                      label: intl.formatMessage(messages.allSubTasks),
                      value: allSubtasks,
                    },
                    ...subtasks.map((subtask) => ({
                      label: subtask.toString(),
                      value: subtask,
                    })),
                  ]}
                  data-testid="select-subtask"
                  onChange={(e) =>
                    dispatch({
                      type: AnalyzerStateActionType.setSelectedSubTask,
                      selectedSubTaskId:
                        e.target.value !== allSubtasks
                          ? e.target.value
                          : undefined,
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

                <Input
                  label={messages.automaticGrouping}
                  type="checkbox"
                  checked={state.isAutomaticGrouping}
                  onChange={(e) =>
                    dispatch({
                      type: AnalyzerStateActionType.setAutomaticGrouping,
                      isAutomaticGrouping: e.target.checked,
                    })
                  }
                />

                {state.isAutomaticGrouping && (
                  <Input
                    label={messages.numberOfGroups}
                    type="number"
                    value={state.numberOfGroups}
                    onChange={(e) =>
                      dispatch({
                        type: AnalyzerStateActionType.setNumberOfGroups,
                        numberOfGroups: parseInt(e.target.value),
                      })
                    }
                  />
                )}

                {!isGroupingAvailable && (
                  <FormattedMessage
                    id="Analyzer.noGroupingAvailable"
                    defaultMessage="Computing groups, please be patient."
                  />
                )}
              </AnalysisParameters>
            </Col>
            <Col xs={12} lg={9}>
              <Analysis
                taskType={task.type}
                state={state}
                dispatch={dispatch}
                categorizedDataPoints={categorizedDataPoints}
                manualGroups={manualGroups}
                onSelectAnalysis={onSelectSolution}
              />
            </Col>
            <Col xs={12}>
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
            </Col>
          </Row>
        )}
      </MultiSwrContent>
      <Modal
        show={state.comparison.clickedAnalysis !== undefined}
        onHide={() =>
          dispatch({
            type: AnalyzerStateActionType.setClickedAnalysis,
            clickedAnalysis: undefined,
          })
        }
        data-testid="solution-selection-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {intl.formatMessage(messages.selectSolutionForComparisonTitle)}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {intl.formatMessage(messages.selectSolutionForComparisonDescription)}
        </Modal.Body>
        <Modal.Footer>
          <Button
            onClick={() => {
              if (state.comparison.clickedAnalysis) {
                dispatch({
                  type: AnalyzerStateActionType.setSelectedLeft,
                  groupKey: state.comparison.clickedAnalysis.groupKey,
                  sourceId: state.comparison.clickedAnalysis.sourceId,
                });

                dispatch({
                  type: AnalyzerStateActionType.setClickedAnalysis,
                  clickedAnalysis: undefined,
                });
              }
            }}
            variant={ButtonVariant.primary}
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
                  sourceId: state.comparison.clickedAnalysis.sourceId,
                });

                dispatch({
                  type: AnalyzerStateActionType.setClickedAnalysis,
                  clickedAnalysis: undefined,
                });
              }
            }}
            variant={ButtonVariant.primary}
            data-testid="cancel-button"
          >
            {intl.formatMessage(messages.selectSolutionForComparisonRight)}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Analyzer;
