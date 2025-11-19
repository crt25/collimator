import { Box, Grid, GridItem, HStack, Icon } from "@chakra-ui/react";
import { useContext, useEffect, useMemo, useState } from "react";
import { FormattedMessage } from "react-intl";
import { LuArrowLeft, LuArrowRight } from "react-icons/lu";
import Button from "../Button";
import SwrContent from "../SwrContent";
import Select from "../form/Select";
import CodeView from "./CodeView";
import { getOptions } from "./CodeComparison";
import { useStudentAnonymization } from "@/hooks/useStudentAnonymization";
import { AuthenticationContext } from "@/contexts/AuthenticationContext";
import { CurrentAnalysis } from "@/api/collimator/models/solutions/current-analysis";
import { ExistingSessionExtended } from "@/api/collimator/models/sessions/existing-session-extended";
import { ExistingTask } from "@/api/collimator/models/tasks/existing-task";
import { useCurrentSessionTaskSolutions } from "@/api/collimator/hooks/solutions/useCurrentSessionTaskSolutions";
import { ExistingClassExtended } from "@/api/collimator/models/classes/existing-class-extended";

type Option = {
  label: string;
  value: string;
};

const ShowcasePresentationInternal = ({
  klass,
  session,
  task,
  analyses,
  selectedSolutionIds,
}: {
  klass: ExistingClassExtended;
  session: ExistingSessionExtended;
  task: ExistingTask;
  analyses: CurrentAnalysis[];
  selectedSolutionIds: string[];
}) => {
  const authContext = useContext(AuthenticationContext);
  const [anonymizationState] = useStudentAnonymization();

  const selectedAnalyses = useMemo(
    () =>
      analyses
        .map((analysis) => ({
          analysis,
          index: selectedSolutionIds.indexOf(analysis.solutionId),
        }))
        .filter((a) => a.index !== -1)
        .toSorted((a, b) => a.index - b.index)
        .map((a) => a.analysis),
    [analyses, selectedSolutionIds],
  );

  const [selectedSolutionId, setSelectedSolutionId] = useState(
    analyses[0].solutionId,
  );
  const [analysesOptions, setAnalysesOptions] = useState<Option[]>([]);

  useEffect(() => {
    let isCancelled = false;

    getOptions(authContext, analyses, anonymizationState.showActualName).then(
      (options) => {
        if (isCancelled) {
          return;
        }

        setAnalysesOptions(options);
      },
    );

    return () => {
      isCancelled = true;
    };
  }, [analyses, anonymizationState.showActualName, authContext]);

  const selectedSolution = useMemo(
    () => selectedAnalyses.find((a) => a.solutionId === selectedSolutionId)!,
    [selectedAnalyses, selectedSolutionId],
  );

  return (
    <Grid templateColumns="repeat(12, 1fr)" gap="md" marginBottom="md">
      <GridItem
        colSpan={12}
        display="flex"
        justifyContent="space-between"
        gap="md"
      >
        <Button onClick={() => {}}>
          <HStack>
            <Icon>
              <LuArrowLeft />
            </Icon>
            <FormattedMessage
              id="ShowcasePresentation.previous"
              defaultMessage="Previous"
            />
          </HStack>
        </Button>
        <Box flexGrow={1}>
          <Select
            options={analysesOptions}
            onValueChange={(v) => {
              setSelectedSolutionId(v);
            }}
            value={selectedSolutionId}
            alwaysShow
            noMargin
            data-testid="analysis-y-axis"
          />
        </Box>
        <Button onClick={() => setSelectedSolutionId((i) => {})}>
          <HStack>
            <FormattedMessage
              id="ShowcasePresentation.previous"
              defaultMessage="Next"
            />
            <Icon>
              <LuArrowRight />
            </Icon>
          </HStack>
        </Button>
      </GridItem>
      <GridItem colSpan={12}>
        <CodeView
          classId={klass.id}
          sessionId={session.id}
          taskId={task.id}
          taskType={task.type}
          solutionHash={selectedSolution.solutionHash}
        />
      </GridItem>
    </Grid>
  );
};

const ShowcasePresentation = ({
  klass,
  session,
  task,
  selectedSolutionIds,
}: {
  klass: ExistingClassExtended;
  session: ExistingSessionExtended;
  task: ExistingTask;
  selectedSolutionIds: string[];
}) => {
  const {
    data: analyses,
    isLoading: isLoadingAnalyses,
    error: analysesErrors,
  } = useCurrentSessionTaskSolutions(session.klass.id, session.id, task.id);

  return (
    <SwrContent
      data={analyses}
      isLoading={isLoadingAnalyses}
      error={analysesErrors}
    >
      {(analyses) => (
        <ShowcasePresentationInternal
          klass={klass}
          session={session}
          task={task}
          analyses={analyses}
          selectedSolutionIds={selectedSolutionIds}
        />
      )}
    </SwrContent>
  );
};

export default ShowcasePresentation;
