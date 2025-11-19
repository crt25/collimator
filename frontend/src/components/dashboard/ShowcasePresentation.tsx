import {
  Box,
  Carousel,
  Grid,
  GridItem,
  HStack,
  Icon,
  useCarousel,
} from "@chakra-ui/react";
import { useMemo } from "react";
import { FormattedMessage } from "react-intl";
import { LuArrowLeft, LuArrowRight } from "react-icons/lu";
import Button from "../Button";
import SwrContent from "../SwrContent";
import { StudentName } from "../encryption/StudentName";
import CodeView from "./CodeView";
import { ExistingSessionExtended } from "@/api/collimator/models/sessions/existing-session-extended";
import { ExistingTask } from "@/api/collimator/models/tasks/existing-task";
import { useCurrentSessionTaskSolutions } from "@/api/collimator/hooks/solutions/useCurrentSessionTaskSolutions";
import { ExistingClassExtended } from "@/api/collimator/models/classes/existing-class-extended";
import { CurrentAnalysis } from "@/api/collimator/models/solutions/current-analysis";
import { CurrentStudentAnalysis } from "@/api/collimator/models/solutions/current-student-analysis";
import { ReferenceAnalysis } from "@/api/collimator/models/solutions/reference-analysis";

const getNameOfAnalysis = (analysis: CurrentAnalysis) =>
  analysis instanceof CurrentStudentAnalysis ? (
    <StudentName
      studentId={analysis.studentId}
      keyPairId={analysis.studentKeyPairId}
      pseudonym={analysis.studentPseudonym}
    />
  ) : analysis instanceof ReferenceAnalysis ? (
    analysis.title
  ) : (
    <FormattedMessage
      id="ShowcasePresentation.unknownAnalysisType"
      defaultMessage="Unknown analysis type"
    />
  );

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

  const carousel = useCarousel({
    slideCount: selectedAnalyses.length,
    allowMouseDrag: true,
    slidesPerPage: 1,
    loop: true,
  });

  const selectedSolution = useMemo(
    () => selectedAnalyses[carousel.page],
    [selectedAnalyses, carousel.page],
  );

  return (
    <Grid templateColumns="repeat(12, 1fr)" gap="md" marginBottom="md">
      <GridItem
        colSpan={12}
        display="flex"
        justifyContent="space-between"
        gap="md"
      >
        <Button onClick={() => carousel.scrollPrev()}>
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
          <Carousel.RootProvider value={carousel} height="full">
            <Carousel.ItemGroup height="full">
              {selectedAnalyses.map((analysis, index) => (
                <Carousel.Item
                  key={index}
                  index={index}
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  fontWeight="semiBold"
                  height="full"
                  overflow="hidden"
                >
                  <HStack gap="sm">
                    <span>{index + 1}.</span>
                    {getNameOfAnalysis(analysis)}
                  </HStack>
                </Carousel.Item>
              ))}
            </Carousel.ItemGroup>
          </Carousel.RootProvider>
        </Box>
        <Button onClick={() => carousel.scrollNext()}>
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
