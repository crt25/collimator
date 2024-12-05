import { expect, test } from "../helpers";
import { UserFormPageModel } from "./user-form-page-model";
import { UserType } from "@/api/collimator/generated/models";
import { UserListPageModel } from "./user-list-page-model";
import { useAdminUser } from "../authentication-helpers";
import { userList } from "../selectors";

const newTeacherName = "new teacher name";
const newTeacherEmail = "teacher.new@example.com";
let newTeacherId: number = -1;

const updatedTeacherName = "updated teacher name";
const updatedTeacherEmail = "teacher.updated@example.com";

const newAdminName = "new admin name";
const newAdminEmail = "admin.new@example.com";
let newAdminId: number = -1;

const updatedAdminName = "updated admin name";
const updatedAdminEmail = "admin.updated@example.com";

test.describe("user management", () => {
  test.beforeEach(async ({ page, baseURL, context }) => {
    await useAdminUser(context);

    await page.goto(`${baseURL}/user`);
  });

  test.describe("/user/create", () => {
    test.beforeEach(async ({ page }) => {
      const list = await UserListPageModel.create(page);
      await list.createItem();
    });

    test("can create a new teacher", async ({ page: pwPage, baseURL }) => {
      const page = await UserFormPageModel.create(pwPage);

      await page.inputs.name.fill(newTeacherName);
      await page.inputs.email.fill(newTeacherEmail);
      await page.inputs.type.selectOption(UserType.TEACHER);
      await page.submitButton.click();

      await pwPage.waitForURL(`${baseURL}/user`);

      const list = await UserListPageModel.create(pwPage);

      await expect(list.getNameElementByName(newTeacherName)).toHaveCount(1);

      newTeacherId = await list.getIdByName(newTeacherName);
    });

    test("can create a new admin", async ({ page: pwPage, baseURL }) => {
      const page = await UserFormPageModel.create(pwPage);

      await page.inputs.name.fill(newAdminName);
      await page.inputs.email.fill(newAdminEmail);
      await page.inputs.type.selectOption(UserType.ADMIN);
      await page.submitButton.click();

      await pwPage.waitForURL(`${baseURL}/user`);

      const list = await UserListPageModel.create(pwPage);

      await expect(list.getNameElementByName(newAdminName)).toHaveCount(1);

      newAdminId = await list.getIdByName(newAdminName);
    });
  });

  test.describe("/user/{id}/edit", () => {
    test("can update an existing teacher", async ({
      page: pwPage,
      baseURL,
    }) => {
      const list = await UserListPageModel.create(pwPage);
      await list.editItem(newTeacherId);

      const form = await UserFormPageModel.create(pwPage);

      // expect the form to be pre-filled

      expect(await form.inputs.name.inputValue()).toBe(newTeacherName);
      expect(await form.inputs.email.inputValue()).toBe(newTeacherEmail);
      expect(await form.inputs.type.inputValue()).toBe(UserType.TEACHER);

      await form.inputs.name.fill(updatedTeacherName);
      await form.inputs.email.fill(updatedTeacherEmail);
      await form.inputs.type.selectOption(UserType.TEACHER);
      await form.submitButton.click();

      await pwPage.waitForURL(`${baseURL}/user`);

      await expect(list.getName(newTeacherId)).toHaveText(updatedTeacherName);
    });

    test("can promote an existing teacher to an admin", async ({
      page: pwPage,
      baseURL,
    }) => {
      const list = await UserListPageModel.create(pwPage);
      await list.editItem(newTeacherId);

      const form = await UserFormPageModel.create(pwPage);

      await form.inputs.type.selectOption(UserType.ADMIN);
      await form.submitButton.click();

      await pwPage.waitForURL(`${baseURL}/user`);

      await expect(list.getName(newTeacherId)).toHaveText(updatedTeacherName);
    });

    test("can update an existing admin", async ({ page: pwPage, baseURL }) => {
      const list = await UserListPageModel.create(pwPage);
      await list.editItem(newAdminId);

      const form = await UserFormPageModel.create(pwPage);

      // expect the form to be pre-filled

      expect(await form.inputs.name.inputValue()).toBe(newAdminName);
      expect(await form.inputs.email.inputValue()).toBe(newAdminEmail);
      expect(await form.inputs.type.inputValue()).toBe(UserType.ADMIN);

      await form.inputs.name.fill(updatedAdminName);
      await form.inputs.email.fill(updatedAdminEmail);
      await form.inputs.type.selectOption(UserType.ADMIN);
      await form.submitButton.click();

      await pwPage.waitForURL(`${baseURL}/user`);

      await expect(list.getName(newAdminId)).toHaveText(updatedAdminName);
    });

    test("can demote an existing admin to a teacher", async ({
      page: pwPage,
      baseURL,
    }) => {
      const list = await UserListPageModel.create(pwPage);
      await list.editItem(newAdminId);

      const form = await UserFormPageModel.create(pwPage);

      await form.inputs.type.selectOption(UserType.TEACHER);
      await form.submitButton.click();

      await pwPage.waitForURL(`${baseURL}/user`);

      await expect(list.getName(newAdminId)).toHaveText(updatedAdminName);
    });
  });

  test.describe("/user", () => {
    test.beforeEach(async ({ page }) => {
      await UserListPageModel.create(page);
    });

    test("renders the fetched items", async ({ page }) => {
      // 2 from seedings + 2 from the create tests
      expect(page.locator(userList).locator("tbody tr")).toHaveCount(4);
    });

    test("can delete listed items", async ({ page: pwPage }) => {
      const page = await UserListPageModel.create(pwPage);

      await page.deleteItem(newTeacherId);
      await page.deleteItem(newAdminId);

      // Wait for the deletion to be reflected in the UI
      await expect(page.getItemActions(newTeacherId)).toHaveCount(0);
      await expect(page.getItemActions(newAdminId)).toHaveCount(0);
    });
  });
});
