import { useRouter } from "next/router";
import { useCallback, useMemo, useRef } from "react";
import { defineMessages, FormattedMessage, useIntl } from "react-intl";
import { Container } from "@chakra-ui/react";
import { Language } from "iframe-rpc-react/src";
import TaskActions from "@/components/task/TaskActions";
import TaskNavigation from "@/components/task/TaskNavigation";
import { useTask, useTaskFile } from "@/api/collimator/hooks/tasks/useTask";
import { TaskType } from "@/api/collimator/generated/models";
import MultiSwrContent from "@/components/MultiSwrContent";
import Header from "@/components/header/Header";
import CrtNavigation from "@/components/CrtNavigation";
import PageHeading from "@/components/PageHeading";
import Breadcrumbs from "@/components/Breadcrumbs";
import EmbeddedApp, { EmbeddedAppRef } from "@/components/EmbeddedApp";
import { useFileHash } from "@/hooks/useFileHash";
import { jupyterAppHostName, scratchAppHostName } from "@/utilities/constants";
import { executeAsyncWithToasts } from "@/utilities/task";
import { messages as taskMessages } from "@/i18n/task-messages";

const messages = defineMessages({
  title: {
    id: "TaskDetail.title",
    defaultMessage: "Task - {title}",
  },
});

const getDisplaySolveUrl = (taskType: TaskType) => {
  switch (taskType) {
    case TaskType.SCRATCH:
      return `${scratchAppHostName}/solve`;
    case TaskType.JUPYTER:
      return `${jupyterAppHostName}?mode=solve`;
    default:
      return null;
  }
};

const TaskDetail = () => {
  const router = useRouter();
  const intl = useIntl();

  const { taskId } = router.query as {
    taskId: string;
  };

  const {
    data: task,
    error: taskError,
    isLoading: isLoadingTask,
  } = useTask(taskId);

  const {
    data: taskFile,
    isLoading: isLoadingTaskFile,
    error: taskFileError,
  } = useTaskFile(taskId);

  const iframeSrc = useMemo(
    () => (task ? getDisplaySolveUrl(task.type) : null),
    [task],
  );

  const taskFileHash = useFileHash(taskFile);

  const embeddedApp = useRef<EmbeddedAppRef | null>(null);

  const onAppAvailable = useCallback(() => {
    if (embeddedApp.current && taskFile) {
      executeAsyncWithToasts(
        () =>
          embeddedApp.current!.sendRequest("loadTask", {
            task: taskFile,
            language: intl.locale as Language,
          }),
        { intl, descriptor: taskMessages.cannotLoadTask },
      );
    }
    // since taskFileHash is a blob, use its hash as a proxy for its content
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskFile, taskFileHash, intl.locale]);

  return (
    <>
      <Header
        title={messages.title}
        titleParameters={{
          title: task?.title ?? "",
        }}
      />
      <Container marginBottom="md">
        <Breadcrumbs>
          <CrtNavigation breadcrumb task={task} />
        </Breadcrumbs>
        <MultiSwrContent
          data={[task, taskFile]}
          errors={[taskError, taskFileError]}
          isLoading={[isLoadingTask, isLoadingTaskFile]}
        >
          {([task, _taskFile]) => (
            <>
              <PageHeading
                actions={<TaskActions taskId={task.id} />}
                description={task.description}
              >
                {task.title}
              </PageHeading>
              <TaskNavigation taskId={task?.id} />
              {(!!iframeSrc && (
                <EmbeddedApp
                  src={iframeSrc}
                  ref={embeddedApp}
                  onAppAvailable={onAppAvailable}
                />
              )) || (
                <FormattedMessage
                  id="TaskDetail.unsupportedApp"
                  defaultMessage="The unsupported application type {type} was selected (Task id {taskId}). Please report this issue."
                  values={{
                    type: task.type,
                    taskId: task.id,
                  }}
                />
              )}
            </>
          )}
        </MultiSwrContent>
      </Container>
    </>
  );
};

export default TaskDetail;
