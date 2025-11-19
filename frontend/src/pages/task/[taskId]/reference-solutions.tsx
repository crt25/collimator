import { useRouter } from "next/router";
import { useCallback } from "react";
import { defineMessages } from "react-intl";
import { Container } from "@chakra-ui/react";
import { useTaskFile } from "@/api/collimator/hooks/tasks/useTask";
import { useUpdateTask } from "@/api/collimator/hooks/tasks/useUpdateTask";
import CrtNavigation from "@/components/CrtNavigation";
import Header from "@/components/Header";
import MultiSwrContent from "@/components/MultiSwrContent";
import { useTaskWithReferenceSolutions } from "@/api/collimator/hooks/tasks/useTaskWithReferenceSolutions";
import PageHeading from "@/components/PageHeading";
import TaskNavigation from "@/components/task/TaskNavigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import TaskActions from "@/components/task/TaskActions";
import TaskFormReferenceSolutions, {
  TaskFormReferenceSolutionsSubmission,
} from "@/components/task/TaskFormReferenceSolutions";

const messages = defineMessages({
  title: {
    id: "TaskReferenceSolutions.title",
    defaultMessage: "Edit Task - {title}",
  },
  submit: {
    id: "TaskReferenceSolutions.submit",
    defaultMessage: "Save Task",
  },
});

const TaskReferenceSolutions = () => {
  const router = useRouter();
  const { taskId } = router.query as {
    taskId?: string;
  };

  const task = useTaskWithReferenceSolutions(taskId);
  const taskFile = useTaskFile(taskId);
  const updateTask = useUpdateTask();

  const onSubmit = useCallback(
    async ({
      referenceSolutions,
      referenceSolutionsFiles,
    }: TaskFormReferenceSolutionsSubmission) => {
      if (task.data && taskFile.data) {
        const initialSolution = task.data.referenceSolutions.find(
          (s) => s.isInitial,
        );

        if (initialSolution) {
          referenceSolutions.push(initialSolution);
          referenceSolutionsFiles.push(initialSolution.solution);
        }

        await updateTask(task.data.id, {
          ...task.data,
          taskFile: taskFile.data,
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
          {([task, taskFile]) => (
            <>
              <PageHeading
                variant="title"
                actions={<TaskActions taskId={task.id} />}
                description={task.description}
              >
                {task.title}
              </PageHeading>
              <TaskNavigation taskId={task.id} />
              <TaskFormReferenceSolutions
                taskType={task.type}
                taskFile={taskFile}
                initialValues={{
                  referenceSolutions: task.referenceSolutions.filter(
                    (s) => !s.isInitial,
                  ),
                  referenceSolutionFiles: task.referenceSolutions
                    .filter((s) => !s.isInitial)
                    .reduce(
                      (acc, solution) => {
                        acc[solution.id] = solution.solution;
                        return acc;
                      },
                      {} as Record<number, Blob>,
                    ),
                }}
                submitMessage={messages.submit}
                onSubmit={onSubmit}
              />
            </>
          )}
        </MultiSwrContent>
      </Container>
    </>
  );
};

export default TaskReferenceSolutions;
