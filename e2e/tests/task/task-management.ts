import { Page } from "@playwright/test";
import { expect } from "../../helpers";
import { TaskTemplateWithSolutions } from "../sessions/tasks/task-template-with-solutions";
import { TaskFormPageModel } from "./task-form-page-model";
import { TaskListPageModel } from "./task-list-page-model";
import { TaskFormReferenceSolutionsPageModel } from "./task-form-reference-solutions-page-model";

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
  await page.setTaskType(task.template.type);
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

  await pwPage.goto(`${baseUrl}/task`);

  await expect(list.getTitleElementByTitle(task.title)).toHaveCount(1);

  const taskId = await list.getIdByName(task.title);

  return {
    id: taskId,
  };
};

export const createReferenceSolutionForTask = async (
  page: TaskFormReferenceSolutionsPageModel,
  pwPage: Page,
  solution: {
    title: string;
    description: string;
    template: TaskTemplateWithSolutions;
  },
): Promise<{ id: number }> => {
  await page.addReferenceSolution();

  const solutionId = await page.lastSolutionId();
  await expect(solutionId).not.toBe(-1);

  await page.fillReferenceSolution(solutionId, {
    title: solution.title,
    description: solution.description,
  });

  await page.openEditSolutionModal(solutionId);

  await page.importSolution(
    "solution template",
    solution.template.mimeType.solution,
    await solution.template.solutions.correct[0](),
  );

  await page.saveSolution();
  await expect(page.getTaskEditModal()).toBeHidden();

  await page.submitForm();
  await expect(page.getSubmitFormButton()).toBeDisabled();

  // A reload is required for the ids to be persisted to the frontend from the backend
  await pwPage.reload();

  await pwPage.waitForSelector("[data-testid=task-reference-solutions-form]");

  const refreshedPage =
    await TaskFormReferenceSolutionsPageModel.create(pwPage);
  const actualSolutionId = await refreshedPage.lastSolutionId();
  await expect(actualSolutionId).not.toBe(-1);

  return {
    id: actualSolutionId,
  };
};
