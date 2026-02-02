import { useRouter } from "next/router";
import { useCallback } from "react";
import { Container } from "@chakra-ui/react";
import { defineMessages } from "react-intl";
import { useTaskFile } from "@/api/collimator/hooks/tasks/useTask";
import {
  useUpdateTask,
  getInitialSolutionOnly,
  appendOrUpdateInitialSolution,
} from "@/api/collimator/hooks/tasks/useUpdateTask";
import CrtNavigation from "@/components/CrtNavigation";
import Header from "@/components/header/Header";
import MultiSwrContent from "@/components/MultiSwrContent";
import TaskForm, { TaskFormSubmission } from "@/components/task/TaskForm";
import { useTaskWithReferenceSolutions } from "@/api/collimator/hooks/tasks/useTaskWithReferenceSolutions";
import PageHeading from "@/components/PageHeading";
import TaskNavigation from "@/components/task/TaskNavigation";
import TaskActions from "@/components/task/TaskActions";
import Breadcrumbs from "@/components/Breadcrumbs";
import MaxScreenHeight from "@/components/layout/MaxScreenHeight";
import PageFooter from "@/components/PageFooter";

const messages = defineMessages({
  title: {
    id: "EditTask.title",
    defaultMessage: "Edit Task - {title}",
  },
  submit: {
    id: "EditTask.submit",
    defaultMessage: "Save Task",
  },
});

const EditTask = () => {
  const router = useRouter();
  const { taskId } = router.query as {
    taskId?: string;
  };

  const task = useTaskWithReferenceSolutions(taskId);
  const taskFile = useTaskFile(taskId);
  const updateTask = useUpdateTask();

  const onSubmit = useCallback(
    async (taskSubmission: TaskFormSubmission) => {
      if (!task.data || !taskFile.data || !taskSubmission.taskFile) {
        return;
      }

      const shouldClearAllSolutions =
        taskSubmission.clearAllReferenceSolutions ?? false;

      const [referenceSolutions, referenceSolutionsFiles] =
        // if we are clearing all solutions
        shouldClearAllSolutions
          ? // then we only keep the initial solution from the submission
            getInitialSolutionOnly(taskSubmission)
          : // otherwise we append or update the initial solution as usual
            appendOrUpdateInitialSolution(
              taskSubmission,
              task.data.referenceSolutions,
            );

      await updateTask(task.data.id, {
        ...taskSubmission,
        // typescript does not track property access through object spreads, so we need to re-add taskFile here
        taskFile: taskSubmission.taskFile,
        referenceSolutions,
        referenceSolutionsFiles,
      });
    },
    [task.data, taskFile.data, updateTask],
  );

  return (
    <MaxScreenHeight>
      <Header
        title={messages.title}
        titleParameters={{
          title: task.data?.title ?? "",
        }}
      />
      <Container>
        <Breadcrumbs>
          <CrtNavigation breadcrumb task={task.data} />
        </Breadcrumbs>
        <MultiSwrContent
          data={[task.data, taskFile.data]}
          isLoading={[task.isLoading, taskFile.isLoading]}
          errors={[task.error, taskFile.error]}
        >
          {([task, taskFile]) => {
            const initialSolution = task.referenceSolutions.find(
              (s) => s.isInitial,
            );

            return (
              <>
                <PageHeading
                  actions={<TaskActions taskId={task?.id} />}
                  description={task.description}
                >
                  {task.title}
                </PageHeading>
                <TaskNavigation taskId={task?.id} />
                <TaskForm
                  initialValues={{
                    ...task,
                    taskFile,
                    initialSolution: initialSolution ?? null,
                    initialSolutionFile: initialSolution?.solution ?? null,
                  }}
                  submitMessage={messages.submit}
                  hasReferenceSolutions={
                    // only consider reference solutions that are not marked as initial
                    task.referenceSolutions.some((s) => !s.isInitial)
                  }
                  onSubmit={onSubmit}
                />
              </>
            );
          }}
        </MultiSwrContent>
      </Container>
      <PageFooter />
    </MaxScreenHeight>
  );
};

export default EditTask;
