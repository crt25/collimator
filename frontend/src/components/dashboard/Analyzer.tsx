import { useCallback, useMemo, useReducer } from "react";
import { defineMessages, FormattedMessage } from "react-intl";
import { Grid, GridItem } from "@chakra-ui/react";
import { ExistingSessionExtended } from "@/api/collimator/models/sessions/existing-session-extended";
import { useCurrentSessionTaskSolutions } from "@/api/collimator/hooks/solutions/useCurrentSessionTaskSolutions";
import { AstCriterionType } from "@/data-analyzer/analyze-asts";
import { CurrentAnalysis } from "@/api/collimator/models/solutions/current-analysis";
import { ExistingTask } from "@/api/collimator/models/tasks/existing-task";
import MultiSwrContent from "../MultiSwrContent";
import Select from "../form/Select";
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
});

const Analyzer = ({
  session,
  task,
}: {
  session: ExistingSessionExtended;
  task: ExistingTask;
}) => {
  const [state, dispatch] = useReducer(analyzerStateReducer, {
    selectedTask: session.tasks[0]?.id,
    selectedSubTaskId: undefined,
    isAutomaticGrouping: false,
    xAxis: AstCriterionType.statement,
    yAxis: MetaCriterionType.test,
    filters: [],
    splits: [],
    selectedSolutionIds: new Set<string>(),
    comparison: { selectedSolutionIds: new Set<string>() },
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
      dispatch({
        type: AnalyzerStateActionType.setAnalysesSelectedForComparison,
        solutionIds: [solutionId],
        unionWithPrevious: true,
      });
    },
    [],
  );

  if (!state.selectedTask) {
    return (
      <FormattedMessage
        id="Analyzer.noTasksInSession"
        defaultMessage="There are no tasks in this lesson."
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
    </>
  );
};

export default Analyzer;
