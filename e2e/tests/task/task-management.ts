import { Page } from "@playwright/test";
import { expect } from "../../helpers";
import { TaskTemplateWithSolutions } from "../sessions/tasks/task-template-with-solutions";
import { TaskFormPageModel } from "./task-form-page-model";
import { TaskListPageModel } from "./task-list-page-model";
import { TaskFormReferenceSolutionsPageModel } from "./task-form-reference-solutions-page-model";

type TaskParams = {
  baseUrl: string;
  pwPage: Page;
  task: {
    title: string;
    description: string;
    template: TaskTemplateWithSolutions;
  };
};

export type ReferenceSolutionParams = {
  baseUrl: string;
  pwPage: Page;
  taskId: number;
  solution: {
    title: string;
    description: string;
    template: TaskTemplateWithSolutions;
  };
};

type TaskUpdateParams = {
  baseUrl: string;
  pwPage: Page;
  taskId: number;
  newType: string;
};

export const createTask = async (
  baseUrl: TaskParams["baseUrl"],
  pwPage: TaskParams["pwPage"],
  task: TaskParams["task"],
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
  baseUrl: ReferenceSolutionParams["baseUrl"],
  pwPage: ReferenceSolutionParams["pwPage"],
  taskId: ReferenceSolutionParams["taskId"],
  solution: ReferenceSolutionParams["solution"],
): Promise<{ id: number }> => {
  await pwPage.goto(`${baseUrl}/task/${taskId}/reference-solutions`);

  const page = await TaskFormReferenceSolutionsPageModel.create(pwPage);

  await page.addReferenceSolution();

  const solutionId = await page.lastSolutionId();

  await page.fillReferenceSolution(solutionId, {
    title: solution.title,
    description: solution.description,
  });

  await page.openEditSolutionModal(solutionId);

  const fileChooserPromise = pwPage.waitForEvent("filechooser");
  await page.importSolution();
  const fileChooser = await fileChooserPromise;

  await fileChooser.setFiles({
    name: "solution template",
    mimeType: solution.template.mimeType.solution,
    buffer: await solution.template.solutions.correct[0](),
  });

  await page.saveSolution();
  await page.submitForm();

  // A reload is required for the ids to be persisted to the frontend from the backend
  await pwPage.reload();

  await pwPage.waitForSelector("[data-testid=task-reference-solutions-form]");

  const refreshedPage =
    await TaskFormReferenceSolutionsPageModel.create(pwPage);
  const actualSolutionId = await refreshedPage.lastSolutionId();

  return {
    id: actualSolutionId,
  };
};

export const openEditSolutionModalAndCancel = async (
  baseUrl: ReferenceSolutionParams["baseUrl"],
  pwPage: ReferenceSolutionParams["pwPage"],
  taskId: ReferenceSolutionParams["taskId"],
  solutionId: number,
): Promise<void> => {
  await pwPage.goto(`${baseUrl}/task/${taskId}/reference-solutions`);

  const page = await TaskFormReferenceSolutionsPageModel.create(pwPage);

  await page.openEditSolutionModal(solutionId);
  await page.cancelSolutionModal();
};

export const openEditSolutionModalAndClose = async (
  baseUrl: ReferenceSolutionParams["baseUrl"],
  pwPage: ReferenceSolutionParams["pwPage"],
  taskId: ReferenceSolutionParams["taskId"],
  solutionId: number,
): Promise<void> => {
  await pwPage.goto(`${baseUrl}/task/${taskId}/reference-solutions`);

  const page = await TaskFormReferenceSolutionsPageModel.create(pwPage);

  await page.openEditSolutionModal(solutionId);
  await page.closeSolutionModal();
};

export const changeTaskTypeWithoutSaving = async (
  baseUrl: TaskUpdateParams["baseUrl"],
  pwPage: TaskUpdateParams["pwPage"],
  taskId: TaskUpdateParams["taskId"],
  newType: TaskUpdateParams["newType"],
): Promise<void> => {
  await pwPage.goto(`${baseUrl}/task/${taskId}/detail`);

  const taskForm = await TaskFormPageModel.create(pwPage);
  await taskForm.setTaskType(newType);
};

export const changeTaskTypeAndSave = async (
  baseUrl: TaskUpdateParams["baseUrl"],
  pwPage: TaskUpdateParams["pwPage"],
  taskId: TaskUpdateParams["taskId"],
  newType: TaskUpdateParams["newType"],
): Promise<void> => {
  await pwPage.goto(`${baseUrl}/task/${taskId}/detail`);

  const taskForm = await TaskFormPageModel.create(pwPage);
  await taskForm.setTaskType(newType);
  await taskForm.acceptConfirmationModal();
  await taskForm.openEditTaskModal();
  await taskForm.saveTask();
  await taskForm.submitButton.click();
};

export const verifyReferenceSolutionExists = async (
  baseUrl: ReferenceSolutionParams["baseUrl"],
  pwPage: ReferenceSolutionParams["pwPage"],
  taskId: ReferenceSolutionParams["taskId"],
  solutionId: number,
  expectedTitle: string,
  expectedDescription: string,
): Promise<void> => {
  await pwPage.goto(`${baseUrl}/task/${taskId}/reference-solutions`);

  const page = await TaskFormReferenceSolutionsPageModel.create(pwPage);

  expect(await page.getReferenceSolutionCount()).toBeGreaterThan(0);
  await expect(page.getTitleInput(solutionId)).toHaveValue(expectedTitle);
  await expect(page.getDescriptionTextarea(solutionId)).toHaveValue(
    expectedDescription,
  );
};

export const verifyNoReferenceSolutions = async (
  baseUrl: ReferenceSolutionParams["baseUrl"],
  pwPage: ReferenceSolutionParams["pwPage"],
  taskId: ReferenceSolutionParams["taskId"],
): Promise<void> => {
  await pwPage.goto(`${baseUrl}/task/${taskId}/reference-solutions`);

  const page = await TaskFormReferenceSolutionsPageModel.create(pwPage);

  expect(await page.getReferenceSolutionCount()).toBe(0);
};
