import { useRouter } from "next/router";
import { useCallback } from "react";
import { Container } from "@chakra-ui/react";
import { defineMessages, FormattedMessage } from "react-intl";
import { useTaskFile } from "@/api/collimator/hooks/tasks/useTask";
import { useUpdateTask } from "@/api/collimator/hooks/tasks/useUpdateTask";
import CrtNavigation from "@/components/CrtNavigation";
import Header from "@/components/Header";
import MultiSwrContent from "@/components/MultiSwrContent";
import TaskForm, { TaskFormSubmission } from "@/components/task/TaskForm";
import { useTaskWithReferenceSolutions } from "@/api/collimator/hooks/tasks/useTaskWithReferenceSolutions";
import PageHeading from "@/components/PageHeading";
import { UpdateReferenceSolutionDto } from "@/api/collimator/generated/models";

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
        const referenceSolutions: UpdateReferenceSolutionDto[] =
          task.data.referenceSolutions;

        const referenceSolutionsFiles = task.data.referenceSolutions.map(
          (s) => s.solution,
        );

        if (
          taskSubmission.initialSolution &&
          taskSubmission.initialSolutionFile
        ) {
          referenceSolutions.push(taskSubmission.initialSolution);
          referenceSolutionsFiles.push(taskSubmission.initialSolutionFile);
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
        <CrtNavigation task={task.data} />
        <PageHeading>
          <FormattedMessage id="EditTask.header" defaultMessage="Edit Task" />
        </PageHeading>
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
            );
          }}
        </MultiSwrContent>
      </Container>
    </>
  );
};

export default EditTask;
