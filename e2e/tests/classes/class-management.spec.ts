import { useAdminUser } from "../../authentication-helpers";
import { expect, test } from "../../helpers";
import { classList } from "../../selectors";
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

  test.describe("/class/{id}/edit", () => {
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
      await page.inputs.teacherId.selectOption(
        updatedClassTeacherId.toString(),
      );
      await page.submitButton.click();

      await pwPage.waitForURL(`${baseURL}/class`);

      const list = await ClassListPageModel.create(pwPage);

      await expect(list.getName(newClassId)).toHaveText(updatedClassName);
    });
  });

  test.describe("/class", () => {
    test.beforeEach(async ({ page }) => {
      await ClassListPageModel.create(page);
    });

    test("renders the fetched items", async ({ page }) => {
      expect(page.locator(classList).locator("tbody tr")).toHaveCount(1);
    });

    test("can delete listed items", async ({ page: pwPage }) => {
      const page = await ClassListPageModel.create(pwPage);

      await page.deleteItem(newClassId);

      // Wait for the deletion to be reflected in the UI
      await expect(page.getItemActions(newClassId)).toHaveCount(0);
    });
  });
});
