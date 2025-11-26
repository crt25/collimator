import { Page } from "@playwright/test";
import { expect } from "../../helpers";
import { TaskTemplateWithSolutions } from "../sessions/tasks/task-template-with-solutions";
import { TaskFormPageModel } from "./task-form-page-model";
import { TaskListPageModel } from "./task-list-page-model";

export const createTask = async (
  baseUrl: string,
  pwPage: Page,
  task: {
    title: string;
    description: string;
    template: TaskTemplateWithSolutions;
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
  await page.selectChakraOption(page.inputs.type, task.template.type);
  await page.openEditTaskModal();

  const fileChooserPromise = pwPage.waitForEvent("filechooser");
  await page.importTask();

  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles({
    name: "task template",
    mimeType: task.template.mimeType.template,
    buffer: await task.template.template(),
  });

  await page.saveTask();
  await page.submitButton.click();

  await pwPage.waitForURL(`${baseUrl}/task`);

  await expect(list.getTitleElementByTitle(task.title)).toHaveCount(1);

  const taskId = await list.getIdByName(task.title);

  return {
    id: taskId,
  };
};
