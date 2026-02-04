import { useAdminUser } from "../../authentication-helpers";
import { expect, test } from "../../helpers";
import { taskList } from "../../selectors";
import checkXPositionWithAssertion from "../sessions/tasks/scratch/check-x-position-with-assertion";
import { TaskListPageModel } from "./task-list-page-model";
import { TaskFormPageModel } from "./task-form-page-model";
import {
  createTask,
  createReferenceSolutionForTask,
  ReferenceSolutionParams,
  openEditSolutionModalAndCancel,
  openEditSolutionModalAndClose,
  changeTaskTypeWithoutSaving,
  changeTaskTypeAndSave,
  verifyReferenceSolutionExists,
  verifyNoReferenceSolutions,
} from "./task-management";
import { TaskFormReferenceSolutionsPageModel } from "./task-form-reference-solutions-page-model";
import { TaskType } from "@/api/collimator/generated/models";

const newTaskTitle = "new task name";
const newTaskDecription = "new task description";
let newTaskId: number = -1;
let solutionId: number = 1;

const updatedTaskTitle = "updated task name";
const updatedTaskDecription = "updated task description";
const updatedTaskType = TaskType.SCRATCH;

const referenceSolutionTitle = "reference solution title";
const referenceSolutionDescription = "reference solution description";

test.describe("task management", () => {
  test.beforeEach(async ({ context, page, baseURL }) => {
    await useAdminUser(context);

    await page.goto(`${baseURL}/task`);
  });

  test.describe("/task/[taskId]/detail", () => {
    test("can create a task", async ({ page: pwPage, baseURL }) => {
      newTaskId = await createTask(baseURL!, pwPage, {
        title: newTaskTitle,
        description: newTaskDecription,
        template: checkXPositionWithAssertion,
      }).then((r) => r.id);
    });
  });

  test.describe("/task/[taskId]/detail", () => {
    test.beforeEach(async ({ context, page, baseURL }) => {
      await useAdminUser(context);

      const list = await TaskListPageModel.create(page);
      await list.editItem(newTaskId);
      await page.waitForURL(`${baseURL}/task/${newTaskId}/detail`);
    });

    test("can update a task", async ({ page: pwPage, baseURL }) => {
      const page = await TaskFormPageModel.create(pwPage);

      await page.inputs.title.fill(updatedTaskTitle);
      await page.inputs.description.fill(updatedTaskDecription);
      await page.setTaskType(updatedTaskType);
      await page.openEditTaskModal();
      await page.saveTask();
      await page.submitButton.click();

      await pwPage.goto(`${baseURL}/task`);

      const list = await TaskListPageModel.create(pwPage);
      await expect(list.getTitle(newTaskId)).toHaveText(updatedTaskTitle);
    });
  });

  test.describe("/task/{id}/view", () => {
    test.beforeEach(async ({ baseURL, page }) => {
      const list = await TaskListPageModel.create(page);

      await list.viewItem(newTaskId);
      await page.getByTestId("task-instance-view-task-tab").click();
      await page.waitForURL(`${baseURL}/task/${newTaskId}/view`);
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

    test.describe("/task/{id}/reference-solutions", () => {
      test.beforeEach(async ({ baseURL, page: pwPage }) => {
        await pwPage.goto(`${baseURL}/task/${newTaskId}/reference-solutions`);
        await TaskFormReferenceSolutionsPageModel.create(pwPage);
      });

      test("can create a reference solution for a task", async ({
        page: pwPage,
        baseURL,
      }) => {
        solutionId = await createReferenceSolutionForTask(
          baseURL!,
          pwPage,
          newTaskId,
          {
            title: referenceSolutionTitle,
            description: referenceSolutionDescription,
            template: checkXPositionWithAssertion,
          } satisfies ReferenceSolutionParams["solution"],
        ).then((r) => r.id);

        await verifyReferenceSolutionExists(
          baseURL!,
          pwPage,
          newTaskId,
          solutionId,
          referenceSolutionTitle,
          referenceSolutionDescription,
        );
      });

      test("editing solution but cancelling should keep the reference solution", async ({
        page: pwPage,
        baseURL,
      }) => {
        await openEditSolutionModalAndCancel(
          baseURL!,
          pwPage,
          newTaskId,
          solutionId,
        );

        await verifyReferenceSolutionExists(
          baseURL!,
          pwPage,
          newTaskId,
          solutionId,
          referenceSolutionTitle,
          referenceSolutionDescription,
        );
      });

      test("editing solution but not pressing save should keep the reference solution", async ({
        page: pwPage,
        baseURL,
      }) => {
        await openEditSolutionModalAndClose(
          baseURL!,
          pwPage,
          newTaskId,
          solutionId,
        );

        await verifyReferenceSolutionExists(
          baseURL!,
          pwPage,
          newTaskId,
          solutionId,
          referenceSolutionTitle,
          referenceSolutionDescription,
        );
      });

      test("editing task type with reference solutions but not saving should keep the original task and reference solutions", async ({
        baseURL,
        page: pwPage,
      }) => {
        await changeTaskTypeWithoutSaving(
          baseURL!,
          pwPage,
          newTaskId,
          TaskType.JUPYTER,
        );

        await verifyReferenceSolutionExists(
          baseURL!,
          pwPage,
          newTaskId,
          solutionId,
          referenceSolutionTitle,
          referenceSolutionDescription,
        );
      });

      test("editing task type with reference solutions should overwrite the current task and remove related reference solutions", async ({
        baseURL,
        page: pwPage,
      }) => {
        await changeTaskTypeAndSave(
          baseURL!,
          pwPage,
          newTaskId,
          TaskType.JUPYTER,
        );

        await verifyNoReferenceSolutions(baseURL!, pwPage, newTaskId);
      });
    });

    test("can delete listed items", async ({ page: pwPage }) => {
      const page = await TaskListPageModel.create(pwPage);

      await page.editItem(newTaskId);
      await page.deleteItemAndConfirm(newTaskId);

      await expect(page.getItemActions(newTaskId)).toHaveCount(0);
    });

    // editing tasks with reference solutions should clear the reference solution
    // editing tasks but cancelling with reference solutions should keep the reference solution
    // editing tasks with reference solutions but not pressing save task should keep the reference solution
    // editing tasks without reference solutions should work as expected
    // changing task type should create new task and remove related reference solutions to the old task
    // changing task type but cancelling should keep the original task and reference solutions
    // changing task type but not saving should keep the original task and reference solutions
    // should be able to replace existing task by changing the task type
  });
});
