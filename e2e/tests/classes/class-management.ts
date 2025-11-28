import { Page } from "@playwright/test";
import { expect } from "../../helpers";
import { ClassFormPageModel } from "./class-form-page-model";
import { ClassListPageModel } from "./class-list-page-model";

export const createClass = async (
  baseUrl: string,
  pwPage: Page,
  klass: {
    name: string;
    teacherId?: number;
  },
): Promise<{
  id: number;
  teacherId: number;
}> => {
  await pwPage.goto(`${baseUrl}/class`);

  const list = await ClassListPageModel.create(pwPage);
  await list.createItem();

  const form = await ClassFormPageModel.create(pwPage);

  await form.inputs.className.fill(klass.name);

  const teacherIds = await form.getTeacherIds();
  expect(teacherIds.length).toBeGreaterThanOrEqual(1);

  const newClassTeacherId = klass.teacherId ?? teacherIds[0];

  await form.inputs.teacherId.click();
  await pwPage.locator(`[data-value="${newClassTeacherId}"]`).click();
  await form.submitButton.click();

  const toastButton = pwPage.getByTestId("toast-trigger");
  await toastButton.waitFor({ state: "visible" });
  await toastButton.click();

  await pwPage.waitForURL(`${baseUrl}/class`);

  await expect(list.getNameElementByName(klass.name)).toHaveCount(1);

  const newClassId = await list.getIdByName(klass.name);

  return {
    id: newClassId,
    teacherId: newClassTeacherId,
  };
};
