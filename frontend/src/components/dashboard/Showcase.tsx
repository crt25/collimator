import {
  createListCollection,
  Grid,
  GridItem,
  HStack,
  Icon,
  Listbox,
} from "@chakra-ui/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FormattedMessage } from "react-intl";
import { LuPlus } from "react-icons/lu";
import { useRouter } from "next/router";
import { ExistingSessionExtended } from "@/api/collimator/models/sessions/existing-session-extended";
import { ExistingTask } from "@/api/collimator/models/tasks/existing-task";
import { useCurrentSessionTaskSolutions } from "@/api/collimator/hooks/solutions/useCurrentSessionTaskSolutions";
import { ExistingClassExtended } from "@/api/collimator/models/classes/existing-class-extended";
import { CurrentAnalysis } from "@/api/collimator/models/solutions/current-analysis";
import { CurrentStudentAnalysis } from "@/api/collimator/models/solutions/current-student-analysis";
import { ReferenceAnalysis } from "@/api/collimator/models/solutions/reference-analysis";
import { useShowcaseOrder } from "@/hooks/useShowcaseOrder";
import SwrContent from "../SwrContent";
import Button from "../Button";
import SortableListInput from "../form/SortableList";
import CodeView, { CodeViewContainer } from "./CodeView";
import AnalysisName from "./AnalysisName";

type CurrentAnalysisWithId = {
  id: string;
  value: string;
  analysis: CurrentAnalysis;
  index: number;
};

const ShowcaseInternal = ({
  klass,
  session,
  task,
  analyses,
}: {
  klass: ExistingClassExtended;
  session: ExistingSessionExtended;
  task: ExistingTask;
  analyses: CurrentAnalysis[];
}) => {
  const router = useRouter();
  const [items, setItems] = useState<CurrentAnalysisWithId[]>([]);
  const [selectedSolutionIds, setSelectedSolutionIds] = useState<string[]>([]);
  const selectedSolutionHash = useMemo(
    () =>
      selectedSolutionIds.length === 0
        ? null
        : analyses.find((a) => a.solutionId === selectedSolutionIds[0])
            ?.solutionHash || null,
    [analyses, selectedSolutionIds],
  );

  const listCollection = useMemo(
    () =>
      createListCollection({
        items: items.map((item, index) => ({
          ...item,
          index,
        })),
      }),
    [items],
  );

  const [showcaseOrder, setShowcaseOrder] = useShowcaseOrder(task.id);

  useEffect(() => {
    const maxStudentSolutionIndex = analyses.reduce((maxIndex, analysis) => {
      if (!(analysis instanceof CurrentStudentAnalysis)) {
        return maxIndex;
      }

      const storedIndex = showcaseOrder[analysis.solutionId];

      return storedIndex !== undefined
        ? Math.max(maxIndex, storedIndex)
        : Math.max(maxIndex, 0);
    }, 0);

    setItems(
      analyses
        .filter((a) => a.isReferenceSolution)
        .map(
          (analysis) =>
            ({
              id: analysis.solutionId,
              value: analysis.solutionId,
              analysis,
              index:
                // Use stored order,
                showcaseOrder[analysis.solutionId] ??
                // put reference solutions last
                (analysis instanceof ReferenceAnalysis
                  ? Number.MAX_SAFE_INTEGER
                  : // and new student solutions after all existing ones
                    maxStudentSolutionIndex + 1),
            }) satisfies CurrentAnalysisWithId,
        )
        .toSorted((a, b) => a.index - b.index),
    );
  }, [showcaseOrder, analyses]);

  // Update stored order when items change
  const updateOrder = useCallback(
    (newItemOrder: CurrentAnalysisWithId[]) => {
      const lastNonReferenceIndex = newItemOrder.findLastIndex(
        (a) => a.analysis instanceof CurrentStudentAnalysis,
      );

      const numberOfReferenceSolutions =
        lastNonReferenceIndex === -1
          ? newItemOrder.length
          : newItemOrder.length - lastNonReferenceIndex;

      const referenceSolutionIndexStart =
        Number.MAX_SAFE_INTEGER - numberOfReferenceSolutions + 1;

      setShowcaseOrder(
        Object.fromEntries(
          newItemOrder.map((item, index) => [
            item.analysis.solutionId,
            // Everything before the last student analysis gets its current index
            index <= lastNonReferenceIndex
              ? index
              : // and reference solutions at the end get last safe integer values
                referenceSolutionIndexStart + (index - lastNonReferenceIndex),
          ]),
        ),
      );
    },
    [setShowcaseOrder],
  );

  const solutionIdsToPresent = useMemo(
    () => encodeURIComponent(JSON.stringify(items.map((item) => item.id))),
    [items],
  );

  return (
    <Grid templateColumns="repeat(12, 1fr)" gap="md" marginBottom="md">
      <GridItem
        colSpan={12}
        display="flex"
        justifyContent="center"
        marginTop="lg"
        marginBottom="lg"
      >
        <FormattedMessage
          id="Showcase.instructions"
          defaultMessage="Sort and preview the showcased solutions."
        />
      </GridItem>
      <GridItem colSpan={{ base: 12, md: 3 }}>
        <Listbox.Root
          collection={listCollection}
          value={selectedSolutionIds}
          onValueChange={(details) => setSelectedSolutionIds(details.value)}
          variant="subtle"
        >
          <Listbox.Content padding="0" borderRadius="0" border="0">
            <SortableListInput
              items={listCollection.items}
              updateItems={updateOrder}
              noGap
            >
              {(item) => (
                <Listbox.Item
                  item={item}
                  key={item.value}
                  padding="md"
                  borderRadius="0"
                  backgroundColor={{
                    base: "gray.100",
                    _selected: "gray.300",
                  }}
                >
                  <Listbox.ItemText fontWeight="semiBold">
                    <HStack>
                      {item.index + 1}.{" "}
                      <AnalysisName analysis={item.analysis} />
                    </HStack>
                  </Listbox.ItemText>
                  <Listbox.ItemIndicator />
                </Listbox.Item>
              )}
            </SortableListInput>
          </Listbox.Content>
        </Listbox.Root>
        <Button
          marginTop="1rem"
          onClick={() =>
            router.push(
              `/class/${klass.id}/session/${session.id}/task/${task.id}/student`,
            )
          }
        >
          <HStack>
            <Icon>
              <LuPlus />
            </Icon>
            <FormattedMessage
              id="Showcase.addResult"
              defaultMessage="Add Result to Showcase"
            />
          </HStack>
        </Button>
        <Button
          marginTop="1rem"
          onClick={() =>
            router.push(
              `/class/${klass.id}/session/${session.id}/task/${task.id}/showcase/present?selected=${solutionIdsToPresent}`,
            )
          }
        >
          <FormattedMessage
            id="Showcase.openShowCasePage"
            defaultMessage="Open Showcase Page"
          />
        </Button>
      </GridItem>
      <GridItem colSpan={{ base: 12, md: 9 }}>
        {selectedSolutionHash ? (
          <CodeView
            classId={klass.id}
            sessionId={session.id}
            taskId={task.id}
            taskType={task.type}
            solutionHash={selectedSolutionHash}
          />
        ) : (
          <CodeViewContainer>
            <FormattedMessage
              id="Showcase.noStudentSelectedHelp"
              defaultMessage="Click on a student name to view their solution."
            />
          </CodeViewContainer>
        )}
      </GridItem>
    </Grid>
  );
};

const Showcase = ({
  klass,
  session,
  task,
}: {
  klass: ExistingClassExtended;
  session: ExistingSessionExtended;
  task: ExistingTask;
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
        <ShowcaseInternal
          klass={klass}
          session={session}
          task={task}
          analyses={analyses}
        />
      )}
    </SwrContent>
  );
};

export default Showcase;
