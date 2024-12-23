import styled from "@emotion/styled";
import { Col, Row } from "react-bootstrap";
import { defineMessages, FormattedMessage } from "react-intl";
import Select from "../form/Select";
import { useCallback, useState } from "react";
import AnalyzerFilterForm from "./filter/AnalyzerFilterForm";
import { FilterCriterion } from "./filter";
import { ExistingSessionExtended } from "@/api/collimator/models/sessions/existing-session-extended";
import Analysis from "./Analysis";
import { useTask } from "@/api/collimator/hooks/tasks/useTask";
import CodeComparison from "./CodeComparison";
import { useCurrentSessionTaskSolutions } from "@/api/collimator/hooks/solutions/useCurrentSessionTaskSolutions";
import MultiSwrContent from "../MultiSwrContent";
import { AstCriterionType } from "@/data-analyzer/analyze-asts";
import { AxesCriterionType } from "./axes";
import { ChartSplit } from "./chartjs-plugins/select";
import { MetaCriterionType } from "./criteria/meta-criterion-type";
import { useGrouping } from "./hooks/useGrouping";
import Input from "../form/Input";

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
  automaticGrouping: {
    id: "Analyzer.automaticGrouping",
    defaultMessage: "Automatic Grouping",
  },
  numberOfGroups: {
    id: "Analyzer.numberOfGroups",
    defaultMessage: "Number of groups",
  },
});

const Analyzer = ({ session }: { session: ExistingSessionExtended }) => {
  const [selectedTask, setSelectedTask] = useState<number | undefined>(
    session.tasks[0]?.id,
  );

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

  const {
    isGroupingAvailable,
    categorizedDataPoints,
    groupAssignments,
    groups,
    manualGroups,
  } = useGrouping(
    isAutomaticGrouping,
    numberOfGroups,
    solutions,
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
