import { backendHostName } from "@/utilities/constants";
import { getTasksControllerFindAllV0ResponseMock } from "@/api/collimator/generated/endpoints/tasks/tasks.msw";
import {
  getTasksControllerFindAllV0Url,
  getTasksControllerRemoveV0Url,
} from "@/api/collimator/generated/endpoints/tasks/tasks";
import { TaskTable } from "./TaskTable";

const tasks = getTasksControllerFindAllV0ResponseMock();

export default {
  component: TaskTable,
  title: "TaskTable",
  parameters: {
    mockData: [
      {
        url: `${backendHostName}${getTasksControllerFindAllV0Url()}`,
        method: "GET",
        status: 200,
        response: tasks,
      },

      ...tasks.map((task) => ({
        url: `${backendHostName}${getTasksControllerRemoveV0Url(task.id)}`,
        method: "DELETE",
        status: 200,
        response: () => {
          tasks.splice(tasks.indexOf(task), 1);
          return task;
        },
      })),
    ],
  },
};

export const Default = {};
