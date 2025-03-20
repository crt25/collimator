import { useState } from "react";
import { defineMessages, FormattedMessage, useIntl } from "react-intl";
import { Col, Row } from "react-bootstrap";
import styled from "@emotion/styled";
import { ExistingSessionExtended } from "@/api/collimator/models/sessions/existing-session-extended";
import { useCurrentSessionTaskSolutions } from "@/api/collimator/hooks/solutions/useCurrentSessionTaskSolutions";
import { useTask } from "@/api/collimator/hooks/tasks/useTask";
import MultiSwrContent from "../MultiSwrContent";
import Input from "../form/Input";
import Select from "../form/Select";
import { StudentName } from "../encryption/StudentName";
import AnalysisParameters from "./AnalysisParameters";
import { useSubtasks } from "./hooks/useSubtasks";
import { useSubtaskAnalyses } from "./hooks/useSubtaskAnalyses";
import { allSubtasks } from "./Analyzer.state";
import { useDissimilarAnalyses } from "./hooks/useDissimilarAnalyses";
import CodeView from "./CodeView";

const messages = defineMessages({
  taskSelection: {
    id: "DissimilarityAnalysis.taskSelection",
    defaultMessage: "Task Selection",
  },
  subTaskSelection: {
    id: "DissimilarityAnalysis.subTaskSelection",
    defaultMessage: "Sub-task Selection",
  },
  allSubTasks: {
    id: "DissimilarityAnalysis.allSubTasks",
    defaultMessage: "All sub-tasks",
  },
  numberOfDissimilarSolutions: {
    id: "DissimilarityAnalysis.numberOfDissimilarSolutions",
    defaultMessage: "Number of dissimilar solutions",
  },
});

const CodeViewCol = styled(Col)`
  margin-bottom: 1rem;
`;

const DissimilarityAnalysis = ({
  session,
}: {
  session: ExistingSessionExtended;
}) => {
  const intl = useIntl();

  const [selectedTask, setSelectedTask] = useState<number | undefined>(
    session.tasks[0]?.id,
  );

  const [selectedSubTaskId, setSelectedSubTaskId] = useState<
    string | undefined
  >();

  const [numberOfSolutions, setNumberOfSolutions] = useState<number>(2);

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

  const subtasks = useSubtasks(analyses);
  const subTaskAnalyses = useSubtaskAnalyses(analyses, selectedSubTaskId);
  const { analyses: dissimilarAnalyses, tooManyCombinations } =
    useDissimilarAnalyses(subTaskAnalyses, numberOfSolutions);

  if (!selectedTask) {
    return (
      <FormattedMessage
        id="DissimilarityAnalysis.noTasksInSession"
        defaultMessage="There are no tasks in this session."
      />
    );
  }

  if (tooManyCombinations) {
    return (
      <FormattedMessage
        id="DissimilarityAnalysis.tooManyCombinations"
        defaultMessage="Too many combinations to calculate dissimilar pairs."
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
                    setSelectedTask(parseInt(e.target.value, 10))
                  }
                  value={selectedTask}
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
                    setSelectedSubTaskId(
                      e.target.value !== allSubtasks
                        ? e.target.value
                        : undefined,
                    )
                  }
                  value={selectedSubTaskId}
                  alwaysShow
                />

                <Input
                  label={messages.numberOfDissimilarSolutions}
                  type="number"
                  value={numberOfSolutions}
                  min={2}
                  max={subTaskAnalyses?.length}
                  onChange={(e) =>
                    setNumberOfSolutions(Math.max(2, parseInt(e.target.value)))
                  }
                />
              </AnalysisParameters>
            </Col>
            <Col xs={12} lg={9}>
              <Row>
                {dissimilarAnalyses
                  ? dissimilarAnalyses.map((analysis) => (
                      <CodeViewCol key={analysis.sourceId} xs={12} lg={6}>
                        <StudentName
                          pseudonym={analysis.studentPseudonym}
                          keyPairId={analysis.studentKeyPairId}
                        />
                        <CodeView
                          classId={session.klass.id}
                          sessionId={session.id}
                          taskId={task.id}
                          subTaskId={selectedSubTaskId}
                          taskType={task.type}
                          solutionHash={analysis.solutionHash}
                        />
                      </CodeViewCol>
                    ))
                  : null}
              </Row>
            </Col>
          </Row>
        )}
      </MultiSwrContent>
    </>
  );
};

export default DissimilarityAnalysis;
