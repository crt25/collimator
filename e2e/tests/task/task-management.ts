import { Page } from "@playwright/test";
import { expect } from "../../helpers";
import { TaskFormPageModel } from "./task-form-page-model";
import { TaskListPageModel } from "./task-list-page-model";
import { TaskType } from "@/api/collimator/generated/models";

export const createTask = async (
  baseUrl: string,
  pwPage: Page,
  task: {
    title: string;
    description: string;
    type: TaskType;
  },
): Promise<{
  id: number;
}> => {
  await pwPage.goto(`${baseUrl}/task`);

  const list = await TaskListPageModel.create(pwPage);
  await list.createItem();

  const page = await TaskFormPageModel.create(pwPage);

  await page.inputs.title.fill(task.title);
  await page.inputs.description.fill(task.description);
  await page.inputs.type.selectOption(task.type);
  await page.openEditTaskModal();
  await page.saveTask();
  await page.submitButton.click();

  await pwPage.waitForURL(`${baseUrl}/task`);

  await expect(list.getTitleElementByTitle(task.title)).toHaveCount(1);

  const taskId = await list.getIdByName(task.title);

  return {
    id: taskId,
  };
};
