import { useAdminUser } from "../../authentication-helpers";
import { expect, test } from "../../helpers";
import { taskList } from "../../selectors";
import { TaskListPageModel } from "./task-list-page-model";
import { routeDummyApp } from "./helpers";
import { TaskFormPageModel } from "./task-form-page-model";
import { createTask } from "./task-management";
import { TaskType } from "@/api/collimator/generated/models";

const newTaskTitle = "new task name";
const newTaskDecription = "new task description";
const newTaskType = TaskType.SCRATCH;
let newTaskId: number = -1;

const updatedTaskTitle = "updated task name";
const updatedTaskDecription = "updated task description";
const updatedTaskType = TaskType.SCRATCH;

test.describe("task management", () => {
  test.beforeEach(async ({ context, page, baseURL, scratchURL }) => {
    await useAdminUser(context);

    await routeDummyApp(page, `${scratchURL}/edit`);

    await page.goto(`${baseURL}/task`);
  });

  test.describe("/task/[taskId]/edit", () => {
    test("can create a task", async ({ page: pwPage, baseURL }) => {
      newTaskId = await createTask(baseURL!, pwPage, {
        title: newTaskTitle,
        description: newTaskDecription,
        type: newTaskType,
      }).then((r) => r.id);
    });
  });

  test.describe("/task/[taskId]/edit", () => {
    test.beforeEach(async ({ context, page }) => {
      await useAdminUser(context);

      const list = await TaskListPageModel.create(page);
      await list.editItem(newTaskId);
    });

    test("can update a task", async ({ page: pwPage, baseURL }) => {
      const page = await TaskFormPageModel.create(pwPage);

      await page.inputs.title.fill(updatedTaskTitle);
      await page.inputs.description.fill(updatedTaskDecription);
      await page.inputs.type.selectOption(updatedTaskType);
      await page.openEditTaskModal();
      await page.saveTask();
      await page.submitButton.click();

      await pwPage.waitForURL(`${baseURL}/task`);

      const list = await TaskListPageModel.create(pwPage);
      await expect(list.getTitle(newTaskId)).toHaveText(updatedTaskTitle);
    });
  });

  test.describe("/task/{id}/detail", () => {
    test.beforeEach(async ({ baseURL, page }) => {
      const list = await TaskListPageModel.create(page);

      await list.viewItem(newTaskId);
      await page.waitForURL(`${baseURL}/task/${newTaskId}/detail`);
    });

    test("renders the task", async ({ page }) => {
      await expect(page.locator("iframe")).toHaveCount(1);
    });
  });

  test.describe("/task", () => {
    test.beforeEach(async ({ page }) => {
      await TaskListPageModel.create(page);
    });

    test("renders the fetched items", async ({ page }) => {
      await expect(page.locator(taskList).locator("tbody tr")).toHaveCount(1);
    });

    test("can delete listed items", async ({ page: pwPage }) => {
      const page = await TaskListPageModel.create(pwPage);

      await page.deleteItem(newTaskId);

      // Wait for the deletion to be reflected in the UI
      await expect(page.getItemActions(newTaskId)).toHaveCount(0);
    });
  });
});
