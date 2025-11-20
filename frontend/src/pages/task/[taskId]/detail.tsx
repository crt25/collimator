import { useRouter } from "next/router";
import { useCallback } from "react";
import { Container } from "@chakra-ui/react";
import { defineMessages } from "react-intl";
import { useTaskFile } from "@/api/collimator/hooks/tasks/useTask";
import { useUpdateTask } from "@/api/collimator/hooks/tasks/useUpdateTask";
import CrtNavigation from "@/components/CrtNavigation";
import Header from "@/components/header/Header";
import MultiSwrContent from "@/components/MultiSwrContent";
import TaskForm, { TaskFormSubmission } from "@/components/task/TaskForm";
import { useTaskWithReferenceSolutions } from "@/api/collimator/hooks/tasks/useTaskWithReferenceSolutions";
import PageHeading from "@/components/PageHeading";
import { UpdateReferenceSolutionDto } from "@/api/collimator/generated/models";
import TaskNavigation from "@/components/task/TaskNavigation";
import TaskActions from "@/components/task/TaskActions";
import Breadcrumbs from "@/components/Breadcrumbs";

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
      if (task.data && taskFile.data) {
        let referenceSolutions: UpdateReferenceSolutionDto[];
        let referenceSolutionsFiles: Blob[];

        if (
          taskSubmission.initialSolution &&
          taskSubmission.initialSolutionFile
        ) {
          referenceSolutions = [
            ...task.data.referenceSolutions.filter((s) => !s.isInitial),
            taskSubmission.initialSolution,
          ];

          referenceSolutionsFiles = [
            ...task.data.referenceSolutions
              .filter((s) => !s.isInitial)
              .map((s) => s.solution),
            taskSubmission.initialSolutionFile,
          ];
        } else {
          referenceSolutions = [...task.data.referenceSolutions];
          referenceSolutionsFiles = [
            ...task.data.referenceSolutions.map((s) => s.solution),
          ];
        }

        await updateTask(task.data.id, {
          ...taskSubmission,
          referenceSolutions,
          referenceSolutionsFiles,
        });
      }
    },
    [task.data, taskFile.data, updateTask],
  );

  return (
    <>
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
                  onSubmit={onSubmit}
                />
              </>
            );
          }}
        </MultiSwrContent>
      </Container>
    </>
  );
};

export default EditTask;
