import { useCallback, useMemo, useState } from "react";
import { defineMessages, FormattedMessage, useIntl } from "react-intl";
import { Col, Modal, Row } from "react-bootstrap";
import styled from "@emotion/styled";
import { ExistingSessionExtended } from "@/api/collimator/models/sessions/existing-session-extended";
import { useCurrentSessionTaskSolutions } from "@/api/collimator/hooks/solutions/useCurrentSessionTaskSolutions";
import { useTask } from "@/api/collimator/hooks/tasks/useTask";
import { AstCriterionType } from "@/data-analyzer/analyze-asts";
import MultiSwrContent from "../MultiSwrContent";
import Select from "../form/Select";
import Input from "../form/Input";
import { AxesCriterionType } from "./axes";
import { ChartSplit, SplitType } from "./chartjs-plugins/select";
import { MetaCriterionType } from "./criteria/meta-criterion-type";
import AnalyzerFilterForm from "./filter/AnalyzerFilterForm";
import {
  FilterCriterion,
  FilterCriterionParameters,
  FilterCriterionType,
  runFilter,
} from "./filter";
import { useGrouping } from "./hooks/useGrouping";
import Analysis from "./Analysis";
import CodeComparison from "./CodeComparison";
import { CurrentAnalysis } from "@/api/collimator/models/solutions/current-analysis";
import Button, { ButtonVariant } from "../Button";
import { FilteredAnalysis } from "./hooks/types";

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

const ALL_SUBTASKS = "__ANALYZE_ALL_SUBTASKS__";
export const defaultGroupValue = "null";
export const defaultSolutionValue = -1;

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

  const [bookmarkedSolutionIds, setBookmarkedSolutionIds] = useState<number[]>(
    [],
  );

  // the state for the code comparison - managed in this component so that we can
  // change the state easily when the user clicks on a solution in the analysis chart
  const [selectedSolutionId, setSelectedSolutionId] = useState<
    | {
        groupKey: string;
        solutionId: number;
      }
    | undefined
  >(undefined);
  const [selectedLeftGroup, setSelectedLeftGroup] = useState(defaultGroupValue);
  const [selectedRightGroup, setSelectedRightGroup] =
    useState(defaultGroupValue);

  const [selectedRightSolution, setSelectedRightSolution] =
    useState(defaultSolutionValue);
  const [selectedLeftSolution, setSelectedLeftSolution] =
    useState(defaultSolutionValue);

  const {
    data: task,
    isLoading: isLoadingTask,
    error: taskError,
  } = useTask(selectedTask);

  const {
    data: analyses,
    isLoading: isLoadingAnalyses,
    error: analysesErrors,
  } = useCurrentSessionTaskSolutions(
    session.klass.id,
    session.id,
    selectedTask,
  );

  const subtasks = useMemo(() => {
    if (!analyses) {
      return [];
    }

    return [
      ...analyses
        .map((s) => CurrentAnalysis.findComponentIds(s))
        .reduce((acc, x) => acc.union(x), new Set<string>()),
    ];
  }, [analyses]);

  const subTaskAnalyses = useMemo(
    () =>
      analyses?.map((analysis) =>
        selectedSubTaskId !== undefined
          ? CurrentAnalysis.selectComponent(analysis, selectedSubTaskId)
          : analysis,
      ),
    [analyses, selectedSubTaskId],
  );

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

    for (const f of filters) {
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
  }, [subTaskAnalyses, filters]);

  const { isGroupingAvailable, categorizedDataPoints, groups, manualGroups } =
    useGrouping(
      isAutomaticGrouping,
      numberOfGroups,
      filteredAnalyses,
      splits,
      xAxis,
      yAxis,
    );

  const updateAxis = useCallback(
    (
      axis: AxesCriterionType,
      otherAxis: AxesCriterionType,
      newAxis: AxesCriterionType,
      setAxis: (axis: AxesCriterionType) => void,
      setOtherAxis: (axis: AxesCriterionType) => void,
    ) => {
      let newSplits: ChartSplit[] = [];

      if (otherAxis === newAxis) {
        // flip axes
        setOtherAxis(axis);

        // when flipping axes, keep the splits
        newSplits = splits.map((split) =>
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

      setAxis(newAxis);
      setSplits(newSplits);
    },
    [splits],
  );

  const updateXAxis = useCallback(
    (newAxis: AxesCriterionType) =>
      updateAxis(xAxis, yAxis, newAxis, setXAxis, setYAxis),
    [xAxis, yAxis, updateAxis],
  );

  const updateYAxis = useCallback(
    (newAxis: AxesCriterionType) =>
      updateAxis(yAxis, xAxis, newAxis, setYAxis, setXAxis),
    [xAxis, yAxis, updateAxis],
  );

  const onSelectSolution = useCallback(
    (groupKey: string, { solutionId }: CurrentAnalysis) => {
      if (selectedLeftSolution === defaultSolutionValue) {
        setSelectedLeftGroup(groupKey);
        setSelectedLeftSolution(solutionId);
      } else if (selectedRightSolution === defaultSolutionValue) {
        setSelectedRightGroup(groupKey);
        setSelectedRightSolution(solutionId);
      } else {
        // let the user choose
        setSelectedSolutionId({ groupKey, solutionId });
      }
    },
    [selectedLeftSolution, selectedRightSolution],
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
    <>
      <MultiSwrContent
        data={[task, analyses]}
        isLoading={[isLoadingTask, isLoadingAnalyses]}
        errors={[taskError, analysesErrors]}
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
                  parametersByCriterion={parametersByCriterion}
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
                    onChange={(e) =>
                      setNumberOfGroups(parseInt(e.target.value))
                    }
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
                selectedSolutionIds={[
                  selectedLeftSolution,
                  selectedRightSolution,
                ]}
                onSelectSolution={onSelectSolution}
                bookmarkedSolutionIds={bookmarkedSolutionIds}
              />
            </Col>
            <Col xs={12}>
              {task && (
                <CodeComparison
                  classId={session.klass.id}
                  sessionId={session.id}
                  taskId={task.id}
                  subTaskId={selectedSubTaskId}
                  taskType={task.type}
                  categorizedDataPoints={categorizedDataPoints}
                  groups={groups}
                  xAxis={xAxis}
                  yAxis={yAxis}
                  selectedLeftGroup={selectedLeftGroup}
                  setSelectedLeftGroup={setSelectedLeftGroup}
                  selectedRightGroup={selectedRightGroup}
                  setSelectedRightGroup={setSelectedRightGroup}
                  selectedLeftSolution={selectedLeftSolution}
                  setSelectedLeftSolution={setSelectedLeftSolution}
                  selectedRightSolution={selectedRightSolution}
                  setSelectedRightSolution={setSelectedRightSolution}
                  bookmarkedSolutionIds={bookmarkedSolutionIds}
                  setBookmarkedSolutionIds={setBookmarkedSolutionIds}
                />
              )}
            </Col>
          </Row>
        )}
      </MultiSwrContent>
      <Modal
        show={selectedSolutionId !== undefined}
        onHide={() => setSelectedSolutionId(undefined)}
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
              if (selectedSolutionId) {
                setSelectedLeftGroup(selectedSolutionId.groupKey);
                setSelectedLeftSolution(selectedSolutionId.solutionId);
                setSelectedSolutionId(undefined);
              }
            }}
            variant={ButtonVariant.primary}
            data-testid="cancel-button"
          >
            {intl.formatMessage(messages.selectSolutionForComparisonLeft)}
          </Button>
          <Button
            onClick={() => {
              if (selectedSolutionId) {
                setSelectedRightGroup(selectedSolutionId.groupKey);
                setSelectedRightSolution(selectedSolutionId.solutionId);
                setSelectedSolutionId(undefined);
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
