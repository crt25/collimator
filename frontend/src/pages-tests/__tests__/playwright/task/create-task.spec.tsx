import { ExistingTaskDto, TaskType } from "@/api/collimator/generated/models";
import { signInAndGotoPath } from "../authentication/authentication-helpers";
import { expect, mockUrlResponses, test } from "../helpers";
import { TaskListPageModel } from "./task-list-page-model";
import {
  getTasksControllerFindAllV0ResponseMock,
  getTasksControllerFindOneV0ResponseMock,
  getTasksControllerUpdateFileV0ResponseMock,
} from "@/api/collimator/generated/endpoints/tasks/tasks.msw";
import {
  getTasksControllerFindAllV0Url,
  getTasksControllerFindOneV0Url,
} from "@/api/collimator/generated/endpoints/tasks/tasks";
import { initialDummyTask, routeDummyApp } from "./helpers";
import { TaskFormPageModel } from "./task-form-page-model";
import multipart from "parse-multipart-data";

const task: ExistingTaskDto = getTasksControllerFindOneV0ResponseMock();

const mockTasks = [
  ...getTasksControllerFindAllV0ResponseMock().slice(0, 9),
  task,
];

const updatedTask: ExistingTaskDto = {
  ...getTasksControllerUpdateFileV0ResponseMock(),
  id: task.id,
  type: TaskType.SCRATCH,
};

let createTaskRequest: Buffer | null = null;
let createTaskRequestHeaders: {
  [key: string]: string;
} | null = null;

test.describe("/task/[taskId]/edit", () => {
  test.beforeEach(async ({ page, baseURL, apiURL, scratchURL }) => {
    createTaskRequest = null;
    createTaskRequestHeaders = null;

    await mockUrlResponses(
      page,
      `${apiURL}${getTasksControllerFindAllV0Url()}`,
      {
        get: mockTasks,
        post: updatedTask,
      },
      {
        post: (request) => {
          createTaskRequest = request.postDataBuffer();
          createTaskRequestHeaders = request.headers();
        },
      },
    );

    await mockUrlResponses(
      page,
      `${apiURL}${getTasksControllerFindOneV0Url(task.id)}`,
      {
        get: task,
      },
      {},
    );

    await routeDummyApp(page, `${scratchURL}/edit`);

    await signInAndGotoPath(page, baseURL!, `/task`);

    const list = await TaskListPageModel.create(page);
    await list.createItem();
  });

  test.only("can create a task", async ({ page: pwPage, baseURL }) => {
    const page = await TaskFormPageModel.create(pwPage);

    await page.inputs.title.fill(updatedTask.title);
    await page.inputs.description.fill(updatedTask.description);
    await page.inputs.type.selectOption(updatedTask.type);
    await page.openEditTaskModal();
    await page.saveTask();
    await page.submitButton.click();

    await pwPage.waitForURL(`${baseURL}/task`);

    if (createTaskRequest == null) {
      throw new Error("No create request was sent");
    }

    const parts = multipart.parse(
      createTaskRequest,
      createTaskRequestHeaders
        ? createTaskRequestHeaders["content-type"].split("boundary=")[1]
        : "",
    );

    const title = parts.find((p) => p.name === "title")?.data.toString("utf8");
    const description = parts
      .find((p) => p.name === "description")
      ?.data.toString("utf8");
    const type = parts.find((p) => p.name === "type")?.data.toString("utf8");

    expect({
      title,
      description,
      type,
    }).toEqual({
      title: updatedTask.title,
      description: updatedTask.description,
      type: updatedTask.type,
    });

    const file = parts.find((p) => p.name === "file")?.data.toString("utf8");
    expect(file).toEqual(initialDummyTask);
  });
});
