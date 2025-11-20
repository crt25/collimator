import { useRouter } from "next/router";
import { useMemo, ComponentProps } from "react";
import { HStack, Status, Text } from "@chakra-ui/react";
import { defineMessages, useIntl, FormattedMessage } from "react-intl";
import { ColumnDef } from "@tanstack/react-table";
import { ExistingSessionExtended } from "@/api/collimator/models/sessions/existing-session-extended";
import { useSessionProgress } from "@/api/collimator/hooks/sessions/useSessionProgress";
import { ColumnType } from "@/types/tanstack-types";
import { TaskProgress } from "@/api/collimator/generated/models";
import SwrContent from "./SwrContent";
import ChakraDataTable from "./ChakraDataTable";
import { EmptyState } from "./EmptyState";

type StatusColor = ComponentProps<typeof Status.Indicator>["backgroundColor"];

export type TaskRow = {
  id: number;
  task: ExistingSessionExtended["tasks"][number];
  progress: TaskProgress;
};

const messages = defineMessages({
  titleColumn: {
    id: "TaskProgressList.columns.title",
    defaultMessage: "Task",
  },
  progressColumn: {
    id: "TaskProgressList.columns.progress",
    defaultMessage: "Progress",
  },
  doneStatus: {
    id: "TaskProgressList.status.done",
    defaultMessage: "Done",
  },
  partiallyDoneStatus: {
    id: "TaskProgressList.status.partiallyDone",
    defaultMessage: "Partially Done",
  },
  openedStatus: {
    id: "TaskProgressList.status.opened",
    defaultMessage: "Opened",
  },
  unOpenedStatus: {
    id: "TaskProgressList.status.unOpened",
    defaultMessage: "Not Started",
  },
});

const ProgressTemplate = ({
  progress,
  intl,
}: {
  progress: TaskProgress;
  intl: ReturnType<typeof useIntl>;
}) => {
  const color = useMemo((): StatusColor => {
    switch (progress) {
      case TaskProgress.done:
        return "success";
      case TaskProgress.partiallyDone:
        return "warning";
      case TaskProgress.opened:
        return "info";
      case TaskProgress.unOpened:
      default:
        return "neutral";
    }
  }, [progress]);

  const statusText = useMemo(() => {
    switch (progress) {
      case TaskProgress.done:
        return intl.formatMessage(messages.doneStatus);
      case TaskProgress.partiallyDone:
        return intl.formatMessage(messages.partiallyDoneStatus);
      case TaskProgress.opened:
        return intl.formatMessage(messages.openedStatus);
      case TaskProgress.unOpened:
      default:
        return intl.formatMessage(messages.unOpenedStatus);
    }
  }, [progress, intl]);

  return (
    <HStack>
      <Status.Root>
        <Status.Indicator backgroundColor={color} />
      </Status.Root>
      {statusText}
    </HStack>
  );
};

const TaskList = ({
  classId,
  session,
}: {
  classId: number;
  session: ExistingSessionExtended;
}) => {
  const intl = useIntl();
  const router = useRouter();

  const {
    data: progress,
    isLoading: isLoadingProgress,
    error: progressError,
  } = useSessionProgress(classId, session.id);

  const columns: ColumnDef<TaskRow>[] = useMemo(() => {
    return [
      {
        accessorKey: "title",
        enableSorting: false,
        header: intl.formatMessage(messages.titleColumn),
        cell: (info) => (
          <Text
            fontWeight="semibold"
            fontSize="lg"
            data-testid={`task-${info.row.original.task.id}-title`}
            margin={0}
          >
            {info.row.original.task.title}
          </Text>
        ),
        size: 32,
        meta: {
          columnType: ColumnType.text,
        },
      },
      {
        accessorKey: "progress",
        header: intl.formatMessage(messages.progressColumn),
        enableSorting: false,
        cell: (info) => (
          <ProgressTemplate progress={info.row.original.progress} intl={intl} />
        ),
        meta: { columnType: ColumnType.icon },
      },
    ];
  }, [intl]);

  return (
    <SwrContent
      data={progress}
      isLoading={isLoadingProgress}
      error={progressError}
    >
      {(progress) => {
        const progressByTaskId = progress.taskProgress.reduce(
          (byId, taskProgress) => {
            byId[taskProgress.id] = taskProgress.taskProgress;
            return byId;
          },
          {} as { [key: number]: TaskProgress },
        );

        const taskRows: TaskRow[] = session.tasks.map((task) => ({
          id: task.id,
          task,
          progress: progressByTaskId[task.id],
        }));

        return (
          <ChakraDataTable
            data={taskRows}
            columns={columns}
            features={{
              sorting: false,
            }}
            emptyStateElement={
              <EmptyState
                title={
                  <FormattedMessage
                    id="TaskProgressList.emptyState.title"
                    defaultMessage="No tasks found."
                  />
                }
              />
            }
            onRowClick={(row) => {
              router.push(
                `/class/${classId}/session/${session.id}/task/${row.id}/solve`,
              );
            }}
          />
        );
      }}
    </SwrContent>
  );
};

export default TaskList;
