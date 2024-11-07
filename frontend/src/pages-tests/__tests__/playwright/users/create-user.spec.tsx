import { signInAndGotoPath } from "../authentication/authentication-helpers";
import { expect, jsonResponse, test } from "../helpers";
import { UserFormPageModel } from "./user-form-page-model";
import { CreateUserDto, UserType } from "@/api/collimator/generated/models";
import { getUsersControllerCreateUrl } from "@/api/collimator/generated/endpoints/users/users";
import { getUsersControllerCreateResponseMock } from "@/api/collimator/generated/endpoints/users/users.msw";

test.describe("/user/create", () => {
  const mockCreateResponse = getUsersControllerCreateResponseMock();

  let createRequest: CreateUserDto | null = null;

  test.beforeEach(async ({ page, baseURL, apiURL }) => {
    createRequest = null;

    // Mock the response for the users controller create endpoint
    await page.route(`${apiURL}${getUsersControllerCreateUrl()}`, (route) => {
      createRequest = route.request().postDataJSON();

      return route.fulfill({
        ...jsonResponse,
        body: JSON.stringify(mockCreateResponse),
      });
    });

    await signInAndGotoPath(page, baseURL!, "/user/create");
  });

  test("can create a new teacher", async ({ page: pwPage, baseURL }) => {
    const page = await UserFormPageModel.create(pwPage);

    await page.inputs.name.fill("Jane Doe");
    await page.inputs.email.fill("jane@doe.com");
    await page.inputs.type.selectOption(UserType.TEACHER);
    await page.submitButton.click();

    await pwPage.waitForURL(`${baseURL}/user`);

    expect(createRequest).toEqual({
      name: "Jane Doe",
      email: "jane@doe.com",
      type: UserType.TEACHER,
    });
  });

  test("can create a new admin", async ({ page: pwPage, baseURL }) => {
    const page = await UserFormPageModel.create(pwPage);

    await page.inputs.name.fill("Jane Doe");
    await page.inputs.email.fill("jane@doe.com");
    await page.inputs.type.selectOption(UserType.ADMIN);
    await page.submitButton.click();

    await pwPage.waitForURL(`${baseURL}/user`);

    expect(createRequest).toEqual({
      name: "Jane Doe",
      email: "jane@doe.com",
      type: UserType.ADMIN,
    });
  });
});
