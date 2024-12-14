import { useCallback, useMemo, useState } from "react";
import { defineMessages, FormattedMessage, useIntl } from "react-intl";
import { Col, Row } from "react-bootstrap";
import styled from "@emotion/styled";
import { ExistingSessionExtended } from "@/api/collimator/models/sessions/existing-session-extended";
import { CurrentAnalysis } from "@/api/collimator/models/solutions/current-analysis";
import { useCurrentSessionTaskSolutions } from "@/api/collimator/hooks/solutions/useCurrentSessionTaskSolutions";
import { useTask } from "@/api/collimator/hooks/tasks/useTask";
import { ActorNode } from "@ast/ast-nodes";
import { AstCriterionType } from "@/data-analyzer/analyze-asts";
import MultiSwrContent from "../MultiSwrContent";
import Select from "../form/Select";
import Input from "../form/Input";
import { AxesCriterionType } from "./axes";
import { ChartSplit } from "./chartjs-plugins/select";
import { MetaCriterionType } from "./criteria/meta-criterion-type";
import AnalyzerFilterForm from "./filter/AnalyzerFilterForm";
import { FilterCriterion } from "./filter";
import { useGrouping } from "./hooks/useGrouping";
import Analysis from "./Analysis";
import CodeComparison from "./CodeComparison";

const Parameters = styled.div`
  padding: 1rem;
  border: var(--foreground-color) 1px solid;
  border-radius: var(--border-radius);

  margin-bottom: 1rem;

  select {
    width: 100%;
  }
`;

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
});

/**
 * Generate a derived analysis, keeping everything identical,
 * except it extracts a subset of the general AST.
 *
 * @param analysis The starting analysis
 * @param id The ID of the subtask to extract.
 */
export function selectSubAnalysis(
  analysis: CurrentAnalysis,
  id: string,
): CurrentAnalysis {
  return new CurrentAnalysis({
    ...analysis,
    generalAst: [(analysis.generalAst as ActorNode[])[parseInt(id, 10)]],
  });
}

const ALL_SUBTASKS = "__ANALYZE_ALL_SUBTASKS__";

const Analyzer = ({ session }: { session: ExistingSessionExtended }) => {
  const intl = useIntl();

  const [selectedTask, setSelectedTask] = useState<number | undefined>(
    session.tasks[0]?.id,
  );

  const [selectedSubTaskId, setSelectedSubTaskId] = useState<
    string | undefined
  >();

  const [isAutomaticGrouping, setIsAutomaticGrouping] = useState(false);
  const [numberOfGroups, setNumberOfGroups] = useState(3);

  const [xAxis, setXAxis] = useState<AxesCriterionType>(
    AstCriterionType.statement,
  );
  const [yAxis, setYAxis] = useState<AxesCriterionType>(MetaCriterionType.test);

  const [filters, setFilters] = useState<FilterCriterion[]>([]);
  const [splits, setSplits] = useState<ChartSplit[]>([]);

  const {
    data: task,
    isLoading: isLoadingTask,
    error: taskError,
  } = useTask(selectedTask);

  const {
    data: solutions,
    isLoading: isLoadingSolutions,
    error: solutionsError,
  } = useCurrentSessionTaskSolutions(
    session.klass.id,
    session.id,
    selectedTask,
  );

  // TODO: This is a temporary solution to get the subtasks, find a better way
  const aSolution = solutions?.find((s) => s.generalAst.length > 0);
  const subtasks =
    aSolution?.generalAst.map((_, index) => index.toString()) ?? [];

  const subTaskSolutions = useMemo(() => {
    return solutions?.map((solution) =>
      selectedSubTaskId !== undefined
        ? selectSubAnalysis(solution, selectedSubTaskId)
        : solution,
    );
  }, [solutions, selectedSubTaskId]);

  const {
    isGroupingAvailable,
    categorizedDataPoints,
    groupAssignments,
    groups,
    manualGroups,
  } = useGrouping(
    isAutomaticGrouping,
    numberOfGroups,
    subTaskSolutions,
    filters,
    splits,
    xAxis,
    yAxis,
  );

  const updateXAxis = useCallback(
    (newAxis: AxesCriterionType) => {
      if (yAxis === newAxis) {
        // flip axes
        setYAxis(xAxis);
      }

      setXAxis(newAxis);
    },
    [xAxis, yAxis],
  );

  const updateYAxis = useCallback(
    (newAxis: AxesCriterionType) => {
      if (xAxis === newAxis) {
        // flip axes
        setXAxis(yAxis);
      }

      setYAxis(newAxis);
    },
    [xAxis, yAxis],
  );

  if (!selectedTask) {
    return (
      <FormattedMessage
        id="Analyzer.noTasksInSession"
        defaultMessage="There are no tasks in this session."
      />
    );
  }

  return (
    <MultiSwrContent
      data={[task, solutions]}
      isLoading={[isLoadingTask, isLoadingSolutions]}
      errors={[taskError, solutionsError]}
    >
      {([task]) => (
        <Row>
          <Col xs={12} lg={3}>
            <Parameters>
              <Select
                label={messages.taskSelection}
                options={session.tasks.map((task) => ({
                  label: task.title,
                  value: task.id,
                }))}
                data-testid="select-task"
                onChange={(e) => setSelectedTask(parseInt(e.target.value))}
                value={selectedTask}
                alwaysShow
              />

              <Select
                label={messages.subTaskSelection}
                options={[
                  {
                    label: intl.formatMessage(messages.allSubTasks),
                    value: ALL_SUBTASKS,
                  },
                  ...subtasks.map((subtask) => ({
                    label: subtask.toString(),
                    value: subtask,
                  })),
                ]}
                data-testid="select-task"
                onChange={(e) =>
                  setSelectedSubTaskId(
                    e.target.value !== ALL_SUBTASKS
                      ? e.target.value
                      : undefined,
                  )
                }
                value={selectedSubTaskId}
                alwaysShow
              />

              <AnalyzerFilterForm
                taskType={task.type}
                filters={filters}
                setFilters={setFilters}
              />

              <Input
                label={messages.automaticGrouping}
                type="checkbox"
                checked={isAutomaticGrouping}
                onChange={(e) => setIsAutomaticGrouping(e.target.checked)}
              />

              {isAutomaticGrouping && (
                <Input
                  label={messages.numberOfGroups}
                  type="number"
                  value={numberOfGroups}
                  onChange={(e) => setNumberOfGroups(parseInt(e.target.value))}
                />
              )}

              {!isGroupingAvailable && (
                <FormattedMessage
                  id="Analyzer.noGroupingAvailable"
                  defaultMessage="Computing groups, please be patient."
                />
              )}
            </Parameters>
          </Col>
          <Col xs={12} lg={9}>
            {selectedTask && (
              <Analysis
                taskType={task.type}
                xAxis={xAxis}
                setXAxis={updateXAxis}
                yAxis={yAxis}
                setYAxis={updateYAxis}
                categorizedDataPoints={categorizedDataPoints}
                manualGroups={manualGroups}
                splittingEnabled={!isAutomaticGrouping}
                splits={splits}
                setSplits={setSplits}
              />
            )}
          </Col>
          <Col xs={12}>
            {task && (
              <CodeComparison
                classId={session.klass.id}
                sessionId={session.id}
                taskId={task.id}
                subTaskId={selectedSubTaskId}
                taskType={task.type}
                groupAssignments={groupAssignments}
                groups={groups}
              />
            )}
          </Col>
        </Row>
      )}
    </MultiSwrContent>
  );
};

export default Analyzer;
