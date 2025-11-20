import { Dispatch, useCallback, useContext, useMemo, useState } from "react";
import { defineMessages, FormattedMessage, useIntl } from "react-intl";
import styled from "@emotion/styled";
import {
  Box,
  Collapsible,
  Flex,
  Grid,
  GridItem,
  Heading,
  HStack,
  Icon,
  Tag,
} from "@chakra-ui/react";
import { LuChevronRight, LuX } from "react-icons/lu";
import { TaskType } from "@/api/collimator/generated/models";
import { AuthenticationContext } from "@/contexts/AuthenticationContext";
import { CurrentAnalysis } from "@/api/collimator/models/solutions/current-analysis";
import { CurrentStudentAnalysis } from "@/api/collimator/models/solutions/current-student-analysis";
import { ReferenceAnalysis } from "@/api/collimator/models/solutions/reference-analysis";
import { useStudentAnonymization } from "@/hooks/useStudentAnonymization";
import Button from "../Button";
import { Group, CategorizedDataPoint } from "./hooks/types";
import CodeView from "./CodeView";
import { axisCriteria } from "./axes";
import {
  AnalyzerState,
  AnalyzerStateAction,
  AnalyzerStateActionType,
} from "./Analyzer.state";
import StarAnalysisButton from "./StarAnalysisButton";
import AnalysisName from "./AnalysisName";

const messages = defineMessages({
  groupLabelPrefix: {
    id: "CodeComparison.groupPrefix",
    defaultMessage: "Group: ",
  },
  studentSolutions: {
    id: "CodeComparison.studentSolutions",
    defaultMessage: "Student solutions",
  },
  referenceSolutions: {
    id: "CodeComparison.referenceSolutions",
    defaultMessage: "Reference solutions",
  },
});

const CodeComparisonWrapper = styled.div`
  margin-bottom: 2rem;
`;

type UpdateSelectionProps = {
  addAnalysisToComparison: (analysis: CurrentAnalysis) => void;
  removeAnalysisFromComparison: (analysis: CurrentAnalysis) => void;
};

const AnalysisTag = ({
  analysis,
  selected,
  addAnalysisToComparison,
  removeAnalysisFromComparison,
}: {
  analysis: CurrentAnalysis;
  selected?: boolean;
} & UpdateSelectionProps) => {
  const onClick = useMemo(
    () =>
      selected
        ? () => removeAnalysisFromComparison(analysis)
        : () => addAnalysisToComparison(analysis),
    [analysis, addAnalysisToComparison, removeAnalysisFromComparison, selected],
  );

  return (
    <Tag.Root
      key={analysis.solutionId}
      size="lg"
      as="button"
      cursor="pointer"
      onClick={onClick}
      variant={selected ? "solid" : "subtle"}
      colorScheme={selected ? "blue" : "gray"}
    >
      <Tag.Label>
        <AnalysisName analysis={analysis} withIcon />
      </Tag.Label>
    </Tag.Root>
  );
};

const GroupedDataPoint = ({
  group,
  points,
  selectedSolutionIds,
  addAnalysisToComparison,
  removeAnalysisFromComparison,
}: {
  group: Group;
  points: CategorizedDataPoint[];
  selectedSolutionIds: Set<string>;
} & UpdateSelectionProps) => {
  const analyses = useMemo(
    () => points.flatMap((point) => point.analyses),
    [points],
  );

  const referenceSolutions = useMemo(
    () =>
      analyses
        .filter((analysis) => analysis instanceof ReferenceAnalysis)
        .toSorted((a, b) => a.solutionId.localeCompare(b.solutionId)),
    [analyses],
  );

  const studentAnalyses = useMemo(
    () =>
      analyses
        .filter((analysis) => analysis instanceof CurrentStudentAnalysis)
        .toSorted((a, b) => a.solutionId.localeCompare(b.solutionId)),
    [analyses],
  );

  return (
    <GridItem colSpan={12}>
      <Collapsible.Root defaultOpen marginBottom="md">
        <Collapsible.Trigger>
          <HStack alignItems="center" justifyContent="center">
            <Collapsible.Indicator
              transition="transform 0.2s"
              _open={{ transform: "rotate(90deg)" }}
            >
              <Icon>
                <LuChevronRight />
              </Icon>
            </Collapsible.Indicator>
            <Heading>
              <FormattedMessage {...messages.groupLabelPrefix} />{" "}
              {group.groupLabel}
            </Heading>
          </HStack>
        </Collapsible.Trigger>

        <Box marginTop="md">
          <Collapsible.Content>
            <Flex flexDirection="column" gap="lg">
              <Box>
                <Heading size="sm" marginBottom="sm">
                  <FormattedMessage {...messages.studentSolutions} />
                </Heading>
                <Flex wrap="wrap" gap="md">
                  {studentAnalyses.map((analysis) => (
                    <AnalysisTag
                      key={analysis.solutionId}
                      analysis={analysis}
                      selected={selectedSolutionIds.has(analysis.solutionId)}
                      addAnalysisToComparison={addAnalysisToComparison}
                      removeAnalysisFromComparison={
                        removeAnalysisFromComparison
                      }
                    />
                  ))}
                </Flex>
              </Box>
              <Box>
                <Heading size="sm" marginBottom="sm">
                  <FormattedMessage {...messages.referenceSolutions} />
                </Heading>
                <Flex wrap="wrap" gap="md">
                  {referenceSolutions.map((analysis) => (
                    <AnalysisTag
                      key={analysis.solutionId}
                      analysis={analysis}
                      selected={selectedSolutionIds.has(analysis.solutionId)}
                      addAnalysisToComparison={addAnalysisToComparison}
                      removeAnalysisFromComparison={
                        removeAnalysisFromComparison
                      }
                    />
                  ))}
                </Flex>
              </Box>
            </Flex>
          </Collapsible.Content>
        </Box>
      </Collapsible.Root>
    </GridItem>
  );
};

const SelectedAnalysis = ({
  analysis,
  classId,
  sessionId,
  taskId,
  taskType,
  removeAnalysisFromComparison,
}: {
  analysis: CurrentAnalysis;
  classId: number;
  sessionId: number;
  taskId: number;
  taskType: TaskType;
} & UpdateSelectionProps) => {
  return (
    <GridItem colSpan={{ base: 12, md: 6 }}>
      <HStack marginBottom="sm" justifyContent="space-between">
        <HStack gap="md">
          <Heading size="md">
            <AnalysisName analysis={analysis} withIcon />
          </Heading>
          <StarAnalysisButton
            classId={classId}
            analysis={analysis}
            testId={`star-analysis-${analysis.solutionId}-button`}
          />
        </HStack>
        <Button
          variant="subtle"
          size="lg"
          paddingX="0"
          onClick={() => removeAnalysisFromComparison(analysis)}
        >
          <Icon>
            <LuX />
          </Icon>
        </Button>
      </HStack>
      <CodeView
        classId={classId}
        sessionId={sessionId}
        taskId={taskId}
        taskType={taskType}
        solutionHash={analysis.solutionHash}
      />
    </GridItem>
  );
};

const CodeComparison = ({
  classId,
  sessionId,
  taskId,
  taskType,
  state: {
    comparison: { selectedSolutionIds },
    xAxis,
    yAxis,
  },
  dispatch,
  categorizedDataPoints,
  groups,
}: {
  classId: number;
  sessionId: number;
  taskId: number;
  taskType: TaskType;
  state: AnalyzerState;
  dispatch: Dispatch<AnalyzerStateAction>;
  categorizedDataPoints: CategorizedDataPoint[];
  groups: Group[];
}) => {
  const addAnalysisToComparison = useCallback(
    (analysis: CurrentAnalysis) => {
      dispatch({
        type: AnalyzerStateActionType.setAnalysesSelectedForComparison,
        solutionIds: [analysis.solutionId],
        unionWithPrevious: true,
      });
    },
    [dispatch],
  );

  const removeAnalysisFromComparison = useCallback(
    (analysis: CurrentAnalysis) => {
      dispatch({
        type: AnalyzerStateActionType.setAnalysesSelectedForComparison,
        solutionIds: [...selectedSolutionIds].filter(
          (id) => id !== analysis.solutionId,
        ),
      });
    },
    [dispatch, selectedSolutionIds],
  );

  const xAxisLabel = useMemo(
    () =>
      axisCriteria.find((c) => c.criterion === xAxis)?.messages(taskType).name,
    [xAxis, taskType],
  );

  const yAxisLabel = useMemo(
    () =>
      axisCriteria.find((c) => c.criterion === yAxis)?.messages(taskType).name,
    [yAxis, taskType],
  );

  const groupedDataPoints = useMemo(() => {
    const dataPointsByGroupKey = Object.fromEntries(
      groups.map((groups) => [groups.groupKey, [] as CategorizedDataPoint[]]),
    );

    for (const dataPoint of categorizedDataPoints) {
      if (dataPointsByGroupKey[dataPoint.groupKey]) {
        dataPointsByGroupKey[dataPoint.groupKey].push(dataPoint);
      }
    }

    return groups
      .map((group) => ({
        group,
        points: dataPointsByGroupKey[group.groupKey],
      }))
      .toSorted((a, b) => a.group.groupLabel.localeCompare(b.group.groupLabel));
  }, [groups, categorizedDataPoints]);

  const selectedAnalyses = useMemo(
    () =>
      categorizedDataPoints
        .flatMap((point) => point.analyses)
        .filter((analysis) => selectedSolutionIds.has(analysis.solutionId)),
    [categorizedDataPoints, selectedSolutionIds],
  );

  return (
    <>
      <CodeComparisonWrapper>
        <Heading marginBottom="lg">
          <FormattedMessage
            id="CodeComparison.heading"
            defaultMessage="Comparison"
          />
        </Heading>

        <Grid templateColumns="repeat(12, 1fr)" gap="xl">
          {groupedDataPoints.map(({ group, points }) => (
            <GroupedDataPoint
              key={group.groupKey}
              group={group}
              points={points}
              selectedSolutionIds={selectedSolutionIds}
              addAnalysisToComparison={addAnalysisToComparison}
              removeAnalysisFromComparison={removeAnalysisFromComparison}
            />
          ))}
        </Grid>
        <Grid templateColumns="repeat(12, 1fr)" gap="xl" marginTop="lg">
          {selectedAnalyses.map((selectedAnalysis) => (
            <SelectedAnalysis
              key={selectedAnalysis.solutionId}
              analysis={selectedAnalysis}
              classId={classId}
              sessionId={sessionId}
              taskId={taskId}
              taskType={taskType}
              addAnalysisToComparison={addAnalysisToComparison}
              removeAnalysisFromComparison={removeAnalysisFromComparison}
            />
          ))}
        </Grid>
      </CodeComparisonWrapper>
    </>
  );
};

export default CodeComparison;
