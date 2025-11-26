import { Page } from "@playwright/test";
import { expect } from "../../helpers";
import { SessionFormPageModel } from "./session-form-page-model";
import { SessionListPageModel } from "./session-list-page-model";

export const createSession = async (
  baseUrl: string,
  pwPage: Page,
  session: {
    classId: number;
    name: string;
    description: string;
    taskIds: number[];
    isAnonymous?: boolean;
  },
): Promise<{
  id: number;
  taskIds: number[];
}> => {
  await pwPage.goto(`${baseUrl}/class/${session.classId}/session`);

  const list = await SessionListPageModel.create(pwPage);
  await list.createItem();

  const form = await SessionFormPageModel.create(pwPage);

  await form.inputs.title.fill(session.name);
  await form.inputs.description.fill(session.description);
  await form.inputs.sharingType.click();

  if (session.isAnonymous) {
    await pwPage.locator(`[data-value="anonymous"]`).click();
  } else {
    await pwPage.locator(`[data-value="private"]`).click();
  }

  let availableTaskIds = new Set(await form.getAvailableTaskIds());
  const sessionTaskIds = new Set(session.taskIds);

  // ensure that all tasks that are to be selected are available
  expect(availableTaskIds.intersection(sessionTaskIds).size).toBe(
    sessionTaskIds.size,
  );

  let selectedTaskIds = new Set(await form.getSelectedTaskIds());
  expect(selectedTaskIds.size).toBe(0);

  // select all tasks
  for (const taskId of sessionTaskIds) {
    await form.inputs.addTaskSelect.click();
    await form.selectChakraOption(form.inputs.addTaskSelect, taskId.toString());
    // we expect the chosen task to be removed from the available task select
    const updatedAvailableTaskIds = new Set(await form.getAvailableTaskIds());

    const availableDifference = availableTaskIds.difference(
      updatedAvailableTaskIds,
    );

    expect(availableDifference.size).toBe(1);
    expect([...availableDifference.values()][0]).toBe(taskId);

    // we expect the chosen task to be added to the selected task list
    const updatedSelectedTaskIds = new Set(await form.getSelectedTaskIds());

    const selectedDifference =
      updatedSelectedTaskIds.difference(selectedTaskIds);

    expect(selectedDifference.size).toBe(1);
    expect([...selectedDifference.values()][0]).toBe(taskId);

    availableTaskIds = updatedAvailableTaskIds;
    selectedTaskIds = updatedSelectedTaskIds;
  }

  const selectedTasksOrdered = await form.getSelectedTaskIds();
  const firstTaskId = selectedTasksOrdered[selectedTasksOrdered.length - 1];

  await form.moveTaskToTop(firstTaskId);

  const reorderedSelectedTasks = await form.getSelectedTaskIds();
  expect(reorderedSelectedTasks[0]).toBe(firstTaskId);

  await form.submitButton.click();

  const toastButton = pwPage.getByTestId("toast-action-button");
  await toastButton.waitFor({ state: "visible" });
  await toastButton.click();

  await pwPage.waitForURL(`${baseUrl}/class/${session.classId}/session`);

  await expect(list.getNameElementByTitle(session.name)).toHaveCount(1);

  const newSessionId = await list.getIdByTitle(session.name);

  return { id: newSessionId, taskIds: reorderedSelectedTasks };
};
