import { useRouter } from "next/router";
import { useCallback, useMemo, useRef } from "react";
import { defineMessages, FormattedMessage, useIntl } from "react-intl";
import { Container } from "react-bootstrap";
import { Language } from "iframe-rpc-react/src";
import { useTask, useTaskFile } from "@/api/collimator/hooks/tasks/useTask";
import { TaskType } from "@/api/collimator/generated/models";
import TaskNavigation from "@/components/task/TaskNavigation";
import MultiSwrContent from "@/components/MultiSwrContent";
import Breadcrumbs from "@/components/Breadcrumbs";
import Header from "@/components/Header";
import PageHeader from "@/components/PageHeader";
import CrtNavigation from "@/components/CrtNavigation";
import EmbeddedApp, { EmbeddedAppRef } from "@/components/EmbeddedApp";
import { useFileHash } from "@/hooks/useFileHash";
import { scratchAppHostName } from "@/utilities/constants";

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
      embeddedApp.current.sendRequest({
        procedure: "loadTask",
        arguments: {
          task: taskFile,
          language: intl.locale as Language,
        },
      });
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
      <Container>
        <Breadcrumbs>
          <CrtNavigation breadcrumb task={task} />
        </Breadcrumbs>
        <TaskNavigation taskId={task?.id} />
        <MultiSwrContent
          data={[task, taskFile]}
          errors={[taskError, taskFileError]}
          isLoading={[isLoadingTask, isLoadingTaskFile]}
        >
          {([task, _taskFile]) => (
            <>
              <div>
                <PageHeader>{task.title}</PageHeader>
                <p>{task.description}</p>
              </div>
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
