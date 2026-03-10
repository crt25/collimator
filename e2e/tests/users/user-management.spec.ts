import { expect, test } from "../../helpers";
import { useAdminUser } from "../../authentication-helpers";
import { userList } from "../../selectors";
import { UserFormPageModel } from "./user-form-page-model";
import { UserListPageModel } from "./user-list-page-model";
import { UserType } from "@/api/collimator/generated/models";

// Use unique suffixes to avoid conflicts between parallel test runs
const uniqueSuffix = (): string => Date.now().toString(36);

const updatedTeacherName = "updated teacher name";
const updatedTeacherEmail = "teacher.updated@example.com";

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
      const teacherName = `new teacher ${uniqueSuffix()}`;
      const teacherEmail = `teacher.new.${uniqueSuffix()}@example.com`;

      const page = await UserFormPageModel.create(pwPage);

      await page.inputs.name.fill(teacherName);
      await page.inputs.email.fill(teacherEmail);
      await page.setUserType(UserType.TEACHER);
      await page.submitButton.click();

      await pwPage.waitForURL(`${baseURL}/user`);

      const list = await UserListPageModel.create(pwPage);

      await expect(list.getNameElementByName(teacherName)).toHaveCount(1);
    });

    test("can create a new admin", async ({ page: pwPage, baseURL }) => {
      const adminName = `new admin ${uniqueSuffix()}`;
      const adminEmail = `admin.new.${uniqueSuffix()}@example.com`;

      const page = await UserFormPageModel.create(pwPage);

      await page.inputs.name.fill(adminName);
      await page.inputs.email.fill(adminEmail);
      await page.setUserType(UserType.ADMIN);
      await page.submitButton.click();

      await pwPage.waitForURL(`${baseURL}/user`);

      const list = await UserListPageModel.create(pwPage);

      await expect(list.getNameElementByName(adminName)).toHaveCount(1);
    });
  });

  test.describe("/user", () => {
    test("renders the fetched items", async ({ page }) => {
      const list = await UserListPageModel.create(page);

      // Create a user to ensure the list has at least one item
      const userName = `list test user ${uniqueSuffix()}`;
      const userEmail = `list.test.${uniqueSuffix()}@example.com`;
      await list.createUser(userName, userEmail, UserType.TEACHER);

      // Verify the list contains at least the user we just created
      const rowCount = await page.locator(userList).locator("tbody tr").count();
      expect(rowCount).toBeGreaterThan(0);
    });
  });

  test.describe("/user/{id}/detail", () => {
    test("can update an existing teacher", async ({
      page: pwPage,
      baseURL,
    }) => {
      // Create a teacher to update
      const teacherName = `teacher to update ${uniqueSuffix()}`;
      const teacherEmail = `teacher.update.${uniqueSuffix()}@example.com`;

      const list = await UserListPageModel.create(pwPage);
      const teacherId = await list.createUser(
        teacherName,
        teacherEmail,
        UserType.TEACHER,
      );

      await list.editItem(teacherId);

      const form = await UserFormPageModel.create(pwPage);

      // expect the form to be pre-filled
      expect(await form.inputs.name.inputValue()).toBe(teacherName);
      expect(await form.inputs.email.inputValue()).toBe(teacherEmail);
      expect(await form.inputs.type.inputValue()).toBe(UserType.TEACHER);

      await form.inputs.name.fill(updatedTeacherName);
      await form.inputs.email.fill(updatedTeacherEmail);
      await form.setUserType(UserType.TEACHER);
      await form.submitButton.click();

      await pwPage.goto(`${baseURL}/user`);

      const updatedList = await UserListPageModel.create(pwPage);

      await expect(
        updatedList.getNameElementByName(updatedTeacherName),
      ).toHaveCount(1);
    });

    test("can promote an existing teacher to an admin", async ({
      page: pwPage,
      baseURL,
    }) => {
      // Create a teacher to promote
      const teacherName = `teacher to promote ${uniqueSuffix()}`;
      const teacherEmail = `teacher.promote.${uniqueSuffix()}@example.com`;

      const list = await UserListPageModel.create(pwPage);
      const teacherId = await list.createUser(
        teacherName,
        teacherEmail,
        UserType.TEACHER,
      );

      await list.editItem(teacherId);

      const form = await UserFormPageModel.create(pwPage);

      await form.setUserType(UserType.ADMIN);
      await form.submitButton.click();

      await pwPage.goto(`${baseURL}/user`);

      const updatedList = await UserListPageModel.create(pwPage);

      await expect(updatedList.getNameElementByName(teacherName)).toHaveCount(
        1,
      );
    });

    test("can update an existing admin", async ({ page: pwPage, baseURL }) => {
      // Create an admin to update
      const adminName = `admin to update ${uniqueSuffix()}`;
      const adminEmail = `admin.update.${uniqueSuffix()}@example.com`;

      const list = await UserListPageModel.create(pwPage);
      const adminId = await list.createUser(
        adminName,
        adminEmail,
        UserType.ADMIN,
      );

      await list.editItem(adminId);

      const form = await UserFormPageModel.create(pwPage);

      // expect the form to be pre-filled
      expect(await form.inputs.name.inputValue()).toBe(adminName);
      expect(await form.inputs.email.inputValue()).toBe(adminEmail);
      expect(await form.inputs.type.inputValue()).toBe(UserType.ADMIN);

      await form.inputs.name.fill(updatedAdminName);
      await form.inputs.email.fill(updatedAdminEmail);
      await form.setUserType(UserType.ADMIN);
      await form.submitButton.click();

      await pwPage.goto(`${baseURL}/user`);

      const updatedList = await UserListPageModel.create(pwPage);

      await expect(
        updatedList.getNameElementByName(updatedAdminName),
      ).toHaveCount(1);
    });

    test("can demote an existing admin to a teacher", async ({
      page: pwPage,
      baseURL,
    }) => {
      // Create an admin to demote
      const adminName = `admin to demote ${uniqueSuffix()}`;
      const adminEmail = `admin.demote.${uniqueSuffix()}@example.com`;

      const list = await UserListPageModel.create(pwPage);
      const adminId = await list.createUser(
        adminName,
        adminEmail,
        UserType.ADMIN,
      );

      await list.editItem(adminId);

      const form = await UserFormPageModel.create(pwPage);

      await form.setUserType(UserType.TEACHER);

      await form.submitButton.click();

      await pwPage.goto(`${baseURL}/user`);

      const updatedList = await UserListPageModel.create(pwPage);

      await expect(updatedList.getNameElementByName(adminName)).toHaveCount(1);
    });

    test("can delete items", async ({ page: pwPage }) => {
      // Create a user to delete
      const userName = `user to delete ${uniqueSuffix()}`;
      const userEmail = `user.delete.${uniqueSuffix()}@example.com`;

      const list = await UserListPageModel.create(pwPage);
      const userId = await list.createUser(
        userName,
        userEmail,
        UserType.TEACHER,
      );

      await list.editItem(userId);
      await list.deleteItemAndConfirm(userId);

      // expect to be redirected back to the list page
      await pwPage.waitForURL(/\/user$/);

      // expect the deleted item to no longer be in the list
      await expect(list.getName(userId)).toHaveCount(0);
    });
  });
});
