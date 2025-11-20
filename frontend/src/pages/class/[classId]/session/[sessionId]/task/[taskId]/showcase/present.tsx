import { useRouter } from "next/router";
import { defineMessages, FormattedMessage } from "react-intl";
import { Button, Container, HStack, Icon, Text } from "@chakra-ui/react";
import { useMemo } from "react";
import { LuCornerUpLeft } from "react-icons/lu";
import Header from "@/components/header/Header";
import { useClass } from "@/api/collimator/hooks/classes/useClass";
import MultiSwrContent from "@/components/MultiSwrContent";
import { useClassSession } from "@/api/collimator/hooks/sessions/useClassSession";
import { useTask } from "@/api/collimator/hooks/tasks/useTask";
import AnonymizationToggle from "@/components/AnonymizationToggle";
import ShowcasePresentation from "@/components/dashboard/ShowcasePresentation";
import MaxScreenHeight from "@/components/layout/MaxScreenHeight";
import PageFooter from "@/components/PageFooter";

const messages = defineMessages({
  title: {
    id: "TaskInstanceShowcasePresent.title",
    defaultMessage: "Showcase - {title}",
  },
});

const TaskInstanceShowcasePresent = () => {
  const router = useRouter();
  const { classId, sessionId, taskId, selected } = router.query as {
    classId: string;
    sessionId: string;
    taskId: string;
    selected: string;
  };

  const {
    data: klass,
    error: klassError,
    isLoading: isLoadingKlass,
  } = useClass(classId);

  const {
    data: session,
    error: sessionError,
    isLoading: isLoadingSession,
  } = useClassSession(classId, sessionId);

  const {
    data: task,
    error: taskError,
    isLoading: isLoadingTask,
  } = useTask(taskId);

  const selectedSolutionIds = useMemo(() => {
    try {
      return JSON.parse(decodeURIComponent(selected));
    } catch {
      console.error(
        "Invalid selected solution IDs:",
        decodeURIComponent(selected),
      );
      return [];
    }
  }, [selected]);

  return (
    <MaxScreenHeight>
      <Header
        title={messages.title}
        titleParameters={{
          title: task?.title ?? "",
        }}
      >
        <AnonymizationToggle />
      </Header>
      <Container>
        <Button variant="subtle" onClick={() => router.back()}>
          <HStack>
            <Icon>
              <LuCornerUpLeft />
            </Icon>
            <FormattedMessage
              id="TaskInstanceShowcasePresent.back"
              defaultMessage="Back to task details"
            />
          </HStack>
        </Button>

        <MultiSwrContent
          errors={[klassError, sessionError, taskError]}
          isLoading={[isLoadingKlass, isLoadingSession, isLoadingTask]}
          data={[klass, session, task]}
        >
          {([klass, session, task]) => (
            <>
              <Text fontSize="2xl" marginTop="xl" marginBottom="xl">
                <FormattedMessage
                  id="TaskInstanceShowcasePresent.heading"
                  defaultMessage="Showcase"
                />
              </Text>
              {Array.isArray(selectedSolutionIds) &&
              selectedSolutionIds.length > 0 ? (
                <ShowcasePresentation
                  klass={klass}
                  session={session}
                  task={task}
                  selectedSolutionIds={selectedSolutionIds}
                />
              ) : (
                <FormattedMessage
                  id="TaskInstanceShowcasePresent.noSolutionsSelected"
                  defaultMessage="No solutions selected for showcase presentation."
                />
              )}
            </>
          )}
        </MultiSwrContent>
      </Container>
      <PageFooter />
    </MaxScreenHeight>
  );
};

export default TaskInstanceShowcasePresent;
