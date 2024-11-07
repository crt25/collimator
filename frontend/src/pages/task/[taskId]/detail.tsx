import Breadcrumbs from "@/components/Breadcrumbs";
import Header from "@/components/Header";
import PageHeader from "@/components/PageHeader";
import CrtNavigation from "@/components/CrtNavigation";
import { useRouter } from "next/router";
import { Container } from "react-bootstrap";
import SwrContent from "@/components/SwrContent";
import { useTask } from "@/api/collimator/hooks/tasks/useTask";
import TaskNavigation from "@/components/task/TaskNavigation";

const TaskDetail = () => {
  const router = useRouter();
  const { taskId } = router.query as {
    taskId: string;
  };

  const { data: task, error, isLoading } = useTask(taskId);

  return (
    <>
      <Header />
      <Container>
        <Breadcrumbs>
          <CrtNavigation breadcrumb task={task} />
        </Breadcrumbs>
        <TaskNavigation taskId={task?.id} />
        <SwrContent error={error} isLoading={isLoading} data={task}>
          {(task) => (
            <div>
              <PageHeader>{task.title}</PageHeader>
              <p>{task.description}</p>
            </div>
          )}
        </SwrContent>
      </Container>
    </>
  );
};

export default TaskDetail;
