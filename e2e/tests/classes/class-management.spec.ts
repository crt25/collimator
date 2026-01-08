import { useAdminUser } from "../../authentication-helpers";
import { expect, test } from "../../helpers";
import { classList, emptyStateContent } from "../../selectors";
import { ClassFormPageModel } from "./class-form-page-model";
import { ClassListPageModel } from "./class-list-page-model";
import { createClass } from "./class-management";

const newClassName = "new class name";
let newClassId: number = -1;

let newClassTeacherId: number = -1;

const updatedClassName = "updated class name";
let updatedClassTeacherId: number = -1;

test.describe("class management", () => {
  test.beforeEach(async ({ page, baseURL, context }) => {
    await useAdminUser(context);

    await page.goto(`${baseURL}/class`);
  });

  test.describe("/class/create", () => {
    test("can create a new class", async ({ page: pwPage, baseURL }) => {
      const { id, teacherId } = await createClass(baseURL!, pwPage, {
        name: newClassName,
      });

      newClassId = id;
      newClassTeacherId = teacherId;
    });
  });

  test.describe("/class/{id}/detail", () => {
    test.beforeEach(async ({ page }) => {
      const list = await ClassListPageModel.create(page);
      await list.editItem(newClassId);
    });

    test("can update an existing class", async ({ page: pwPage, baseURL }) => {
      const page = await ClassFormPageModel.create(pwPage);

      // expect the form to be pre-filled

      expect(await page.inputs.className.inputValue()).toBe(newClassName);
      expect(await page.inputs.teacherId.inputValue()).toBe(
        newClassTeacherId.toString(),
      );

      const teacherIds = await page.getTeacherIds();
      const newTeacherId = teacherIds.find((id) => id !== newClassTeacherId);
      expect(newTeacherId).toBeDefined();

      updatedClassTeacherId = newTeacherId!;

      await page.inputs.className.fill(updatedClassName);
      await page.setTeacher(updatedClassTeacherId.toString());
      await page.submitButton.click();

      await pwPage.goto(`${baseURL}/class`);

      const list = await ClassListPageModel.create(pwPage);

      await expect(list.getName(newClassId)).toHaveText(updatedClassName);
    });

    test("shows class details", async ({ page: pwPage }) => {
      const page = await ClassFormPageModel.create(pwPage);

      await expect(page.getForm()).toHaveCount(1);
    });
  });

  test.describe("/class/{id}/students", () => {
    test.beforeEach(async ({ baseURL, page }) => {
      const list = await ClassListPageModel.create(page);

      await list.viewItem(newClassId);
      await page.waitForURL(`${baseURL}/class/${newClassId}/detail`);
      await page.getByTestId("class-students-tab").click();
      await page.waitForURL(`${baseURL}/class/${newClassId}/students`);
    });

    test("renders the student members", async ({ page }) => {
      await expect(page.locator(emptyStateContent)).toHaveCount(0);
    });
  });

  test.describe("/class", () => {
    test.beforeEach(async ({ page }) => {
      await ClassListPageModel.create(page);
    });

    test("renders the fetched items", async ({ page }) => {
      await expect(page.locator(classList).locator("tbody tr")).toHaveCount(1);
    });
  });

  test.describe("/class/{id}/detail", () => {
    test.beforeEach(async ({ baseURL, page }) => {
      const list = await ClassListPageModel.create(page);

      await list.viewItem(newClassId);
      await page.waitForURL(`${baseURL}/class/${newClassId}/detail`);
    });

    test("can delete listed items", async ({ page: pwPage, baseURL }) => {
      const page = await ClassListPageModel.create(pwPage);

      await expect(page.getItemActionsDropdownButton(newClassId)).toHaveCount(
        1,
      );

      await page.deleteItemAndConfirm(newClassId);

      await pwPage.waitForURL(`${baseURL}/class`);

      await expect(page.getItemName(newClassId)).toHaveCount(0);
    });
  });
});
