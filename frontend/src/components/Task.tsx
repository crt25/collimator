import { RefObject, useCallback } from "react";
import { chakra, Dialog, Icon } from "@chakra-ui/react";
import { Submission } from "iframe-rpc-react/src";
import { FormattedMessage } from "react-intl";
import { IoMdClose } from "react-icons/io";
import EmbeddedApp, { EmbeddedAppRef } from "@/components/EmbeddedApp";
import { ExistingSessionExtended } from "@/api/collimator/models/sessions/existing-session-extended";
import { ExistingTask } from "@/api/collimator/models/tasks/existing-task";
import { useTrackStudentActivity } from "@/api/collimator/hooks/student-activity/useTrackStudentActivity";
import { StudentActivityType } from "@/api/collimator/generated/models";
import VerticalSpacing from "./layout/VerticalSpacing";
import TaskList from "./TaskList";
import PageHeading from "./PageHeading";

const TaskWrapper = chakra("div", {
  base: {
    flexGrow: 1,
    position: "relative",
    display: "flex",
  },
});

export interface TaskRef {
  showTaskMenu: boolean;
  setShowTaskMenu: (show: boolean) => void;
}

interface Props {
  session: ExistingSessionExtended;
  classId: number;
  task: ExistingTask;
  showSessionMenu: boolean;
  setShowSessionMenu: (show: boolean) => void;
  iframeSrc: string;
  embeddedApp: RefObject<EmbeddedAppRef | null>;
  onAppAvailable?: () => void;
  onReceiveSubmission?: (submission: Submission) => void;
}

const Task = ({
  classId,
  session,
  task,
  showSessionMenu,
  setShowSessionMenu,
  iframeSrc,
  embeddedApp,
  onAppAvailable,
  onReceiveSubmission,
}: Props) => {
  const trackStudentActivity = useTrackStudentActivity();
  const onSolutionRun = useCallback(
    (solution: Blob) => {
      trackStudentActivity({
        type: StudentActivityType.TASK_RUN_SOLUTION,
        sessionId: session.id,
        taskId: task.id,
        appActivity: null,
        solution,
      });
    },
    [trackStudentActivity, session.id, task.id],
  );

  const onStudentAppActivity = useCallback(
    (action: string, data: Record<string, unknown>, solution: Blob) => {
      trackStudentActivity({
        type: StudentActivityType.TASK_APP_ACTIVITY,
        sessionId: session.id,
        taskId: task.id,
        appActivity: {
          type: action,
          data,
        },
        solution,
      });
    },
    [trackStudentActivity, session.id, task.id],
  );

  return (
    <TaskWrapper>
      {showSessionMenu && (
        <Dialog.Root
          open={showSessionMenu}
          onOpenChange={(e) => setShowSessionMenu(e.open)}
          size="xl"
        >
          <Dialog.Backdrop bg="blackAlpha.600" />
          <Dialog.Positioner>
            <Dialog.Content marginLeft="4xl" marginTop="5xl">
              <Dialog.Header>
                <Dialog.CloseTrigger data-testid="close-session-menu-button">
                  <Icon>
                    <IoMdClose />
                  </Icon>
                </Dialog.CloseTrigger>
              </Dialog.Header>
              <Dialog.Body>
                <PageHeading
                  testId="session-name"
                  description={session.description}
                >
                  <FormattedMessage
                    id="Task.sessionMenu.heading.title"
                    defaultMessage="{sessionName} - Tasks"
                    values={{ sessionName: session.title }}
                  />
                </PageHeading>
                <TaskList
                  classId={classId}
                  session={session}
                  currentTaskId={task.id}
                />
                <VerticalSpacing />
              </Dialog.Body>
            </Dialog.Content>
          </Dialog.Positioner>
        </Dialog.Root>
      )}
      <EmbeddedApp
        src={iframeSrc}
        ref={embeddedApp}
        onAppAvailable={onAppAvailable}
        onReceiveSubmission={onReceiveSubmission}
        onSolutionRun={onSolutionRun}
        onStudentAppActivity={onStudentAppActivity}
      />
    </TaskWrapper>
  );
};

export default Task;
