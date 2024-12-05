import {
  ExistingTaskDto,
  TaskType,
  UpdateTaskDto,
} from "@/api/collimator/generated/models";
import { useAdminUser } from "../authentication-helpers";
import { expect, jsonResponse, mockUrlResponses, test } from "../helpers";
import { TaskListPageModel } from "./task-list-page-model";
import {
  getTasksControllerFindAllV0ResponseMock,
  getTasksControllerFindOneV0ResponseMock,
  getTasksControllerUpdateFileV0ResponseMock,
} from "@/api/collimator/generated/endpoints/tasks/tasks.msw";
import {
  getTasksControllerDownloadOneV0Url,
  getTasksControllerFindAllV0Url,
  getTasksControllerFindOneV0Url,
  getTasksControllerUpdateFileV0Url,
} from "@/api/collimator/generated/endpoints/tasks/tasks";
import { routeDummyApp } from "./helpers";
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

let updateMetaRequest: UpdateTaskDto | null = null;
let updateFileRequest: Buffer | null = null;
let updateFileRequestHeaders: {
  [key: string]: string;
} | null = null;

const existingTaskBinary = new Blob(['{"existing": "task"}'], {
  type: "application/json",
});

test.describe("/task/[taskId]/edit", () => {
  test.beforeEach(async ({ context, page, baseURL, apiURL, scratchURL }) => {
    await useAdminUser(context);

    updateMetaRequest = null;
    updateFileRequest = null;
    updateFileRequestHeaders = null;

    // mock classes response for list
    await page.route(`${apiURL}${getTasksControllerFindAllV0Url()}`, (route) =>
      route.fulfill({
        ...jsonResponse,
        body: JSON.stringify(mockTasks),
      }),
    );

    await mockUrlResponses(
      page,
      `${apiURL}${getTasksControllerFindOneV0Url(task.id)}`,
      {
        get: task,
        patch: updatedTask,
      },
      {
        patch: (request) => {
          updateMetaRequest = request.postDataJSON();
        },
      },
    );

    await page.route(
      `${apiURL}${getTasksControllerUpdateFileV0Url(task.id)}`,
      async (route) => {
        updateFileRequest = route.request().postDataBuffer();
        updateFileRequestHeaders = route.request().headers();

        route.fulfill({
          ...jsonResponse,
          body: JSON.stringify(updatedTask),
        });
      },
    );

    await page.route(
      `${apiURL}${getTasksControllerDownloadOneV0Url(task.id)}`,
      async (route) =>
        route.fulfill({
          status: 200,
          contentType: "application/octet-stream",
          body: Buffer.from(await existingTaskBinary.arrayBuffer()),
        }),
    );

    await routeDummyApp(page, `${scratchURL}/edit`);

    await page.goto(`${baseURL}/task`);

    const list = await TaskListPageModel.create(page);
    await list.editItem(task.id);
  });

  test("can update a task", async ({ page: pwPage, baseURL }) => {
    const page = await TaskFormPageModel.create(pwPage);

    await page.inputs.title.fill(updatedTask.title);
    await page.inputs.description.fill(updatedTask.description);
    await page.inputs.type.selectOption(updatedTask.type);
    await page.openEditTaskModal();
    await page.saveTask();
    await page.submitButton.click();

    await pwPage.waitForURL(`${baseURL}/task`);

    if (updateFileRequest == null) {
      throw new Error("No update request was sent");
    }

    const parts = multipart.parse(
      updateFileRequest,
      updateFileRequestHeaders
        ? updateFileRequestHeaders["content-type"].split("boundary=")[1]
        : "",
    );

    expect(updateMetaRequest).toEqual({
      title: updatedTask.title,
      description: updatedTask.description,
      type: updatedTask.type,
    });

    const file = parts.find((p) => p.name === "file")?.data.toString("utf8");
    expect(file).toEqual(await existingTaskBinary.text());
  });

  test("can update a task without changing the task file", async ({
    page: pwPage,
    baseURL,
  }) => {
    const page = await TaskFormPageModel.create(pwPage);

    await page.inputs.title.fill(updatedTask.title);
    await page.inputs.description.fill(updatedTask.description);
    await page.inputs.type.selectOption(updatedTask.type);
    await page.submitButton.click();

    await pwPage.waitForURL(`${baseURL}/task`);

    expect(updateMetaRequest).toEqual({
      title: updatedTask.title,
      description: updatedTask.description,
      type: updatedTask.type,
    });

    expect(updateFileRequest).toBeNull();
  });
});
