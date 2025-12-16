import { useState } from "react";
import { defineMessages, FormattedMessage } from "react-intl";
import { Grid, GridItem } from "@chakra-ui/react";
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
import { useDissimilarAnalyses } from "./hooks/useDissimilarAnalyses";
import CodeView from "./CodeView";

const messages = defineMessages({
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

const DissimilarityAnalysis = ({
  session,
  task,
}: {
  session: ExistingSessionExtended;
  task: ExistingTask;
}) => {
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
  const { analyses: dissimilarAnalyses, tooManyCombinations } =
    useDissimilarAnalyses(subTaskAnalyses, numberOfSolutions);

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
                  onValueChange={(v) => setSelectedSubTaskId(v)}
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
            </GridItem>
            <GridItem colSpan={{ base: 12, lg: 9 }}>
              <Grid templateColumns="repeat(12, 1fr)" gap={4}>
                {dissimilarAnalyses
                  ? dissimilarAnalyses.map((analysis) => (
                      <GridItem
                        key={analysis.solutionId}
                        colSpan={{ base: 12, lg: 6 }}
                        marginBottom="md"
                      >
                        <StudentName
                          studentId={analysis.studentId}
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
                      </GridItem>
                    ))
                  : null}
              </Grid>
            </GridItem>
          </Grid>
        )}
      </MultiSwrContent>
    </>
  );
};

export default DissimilarityAnalysis;
