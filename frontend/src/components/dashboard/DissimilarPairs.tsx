import { useState } from "react";
import { defineMessages, useIntl } from "react-intl";
import { Col, Row } from "react-bootstrap";
import styled from "@emotion/styled";
import { ExistingSessionExtended } from "@/api/collimator/models/sessions/existing-session-extended";
import { useCurrentSessionTaskSolutions } from "@/api/collimator/hooks/solutions/useCurrentSessionTaskSolutions";
import { ExistingTask } from "@/api/collimator/models/tasks/existing-task";
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

const DissimilarPairs = ({
  session,
  task,
}: {
  session: ExistingSessionExtended;
  task: ExistingTask;
}) => {
  const intl = useIntl();

  const [selectedSubTaskId, setSelectedSubTaskId] = useState<
    string | undefined
  >();

  const [numberOfSolutions, setNumberOfSolutions] = useState<number>(2);

  const {
    data: analyses,
    isLoading: isLoadingAnalyses,
    error: analysesErrors,
  } = useCurrentSessionTaskSolutions(session.klass.id, session.id, task.id);

  const subtasks = useSubtasks(analyses);
  const subTaskAnalyses = useSubtaskAnalyses(analyses, selectedSubTaskId);
  const dissimilarPairs = useDissimilarPairs(
    subTaskAnalyses,
    numberOfSolutions,
  );

  return (
    <>
      <MultiSwrContent
        data={[analyses]}
        isLoading={[isLoadingAnalyses]}
        errors={[analysesErrors]}
      >
        {([_analyses]) => (
          <Row>
            <Col xs={12} lg={3}>
              <AnalysisParameters>
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
                    <Row key={`${a.solutionId}-${b.solutionId}`}>
                      <CodeViewCol key={a.solutionId} xs={12} lg={6}>
                        <StudentName
                          studentId={a.studentId}
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
                      <CodeViewCol key={b.solutionId} xs={12} lg={6}>
                        <StudentName
                          studentId={b.studentId}
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
