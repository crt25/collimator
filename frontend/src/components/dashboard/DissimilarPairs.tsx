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
import CodeView from "./CodeView";
import { useDissimilarPairs } from "./hooks/useDissimilarAnalyses/pairs";

const messages = defineMessages({
  taskSelection: {
    id: "DissimilarPairs.taskSelection",
    defaultMessage: "Task Selection",
  },
  subTaskSelection: {
    id: "DissimilarPairs.subTaskSelection",
    defaultMessage: "Sub-task Selection",
  },
  allSubTasks: {
    id: "DissimilarPairs.allSubTasks",
    defaultMessage: "All sub-tasks",
  },
  numberOfDissimilarPairs: {
    id: "DissimilarPairs.numberOfDissimilarPairs",
    defaultMessage: "Number of dissimilar pairs",
  },
});

const CodeViewCol = styled(Col)`
  margin-bottom: 1rem;
`;

const DissimilarPairs = ({ session }: { session: ExistingSessionExtended }) => {
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
  const dissimilarPairs = useDissimilarPairs(
    subTaskAnalyses,
    numberOfSolutions,
  );

  if (!selectedTask) {
    return (
      <FormattedMessage
        id="DissimilarityAnalysis.noTasksInSession"
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
                  label={messages.numberOfDissimilarPairs}
                  type="number"
                  value={numberOfSolutions}
                  min={1}
                  max={subTaskAnalyses?.length}
                  onChange={(e) =>
                    setNumberOfSolutions(Math.max(1, parseInt(e.target.value)))
                  }
                />
              </AnalysisParameters>
            </Col>
            <Col xs={12} lg={9}>
              {dissimilarPairs
                ? dissimilarPairs.map(([a, b]) => (
                    <Row key={`${a.sourceId}-${b.sourceId}`}>
                      <CodeViewCol key={a.sourceId} xs={12} lg={6}>
                        <StudentName
                          pseudonym={a.studentPseudonym}
                          keyPairId={a.studentKeyPairId}
                        />
                        <CodeView
                          classId={session.klass.id}
                          sessionId={session.id}
                          taskId={task.id}
                          subTaskId={selectedSubTaskId}
                          taskType={task.type}
                          solutionHash={a.solutionHash}
                        />
                      </CodeViewCol>
                      <CodeViewCol key={b.sourceId} xs={12} lg={6}>
                        <StudentName
                          pseudonym={b.studentPseudonym}
                          keyPairId={b.studentKeyPairId}
                        />
                        <CodeView
                          classId={session.klass.id}
                          sessionId={session.id}
                          taskId={task.id}
                          subTaskId={selectedSubTaskId}
                          taskType={task.type}
                          solutionHash={b.solutionHash}
                        />
                      </CodeViewCol>
                    </Row>
                  ))
                : null}
            </Col>
          </Row>
        )}
      </MultiSwrContent>
    </>
  );
};

export default DissimilarPairs;
