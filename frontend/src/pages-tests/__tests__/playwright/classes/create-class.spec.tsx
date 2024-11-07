import { signInAndGotoPath } from "../authentication/authentication-helpers";
import { getClassesControllerCreateV0Url } from "@/api/collimator/generated/endpoints/classes/classes";
import { expect, jsonResponse, test } from "../helpers";
import { getClassesControllerCreateV0ResponseMock } from "@/api/collimator/generated/endpoints/classes/classes.msw";
import { CreateClassForm } from "./create-class-form";
import { CreateClassDto } from "@/api/collimator/generated/models";
import { getUsersControllerFindAllV0Url } from "@/api/collimator/generated/endpoints/users/users";
import { getUsersControllerFindAllV0ResponseMock } from "@/api/collimator/generated/endpoints/users/users.msw";

test.describe("/class/create", () => {
  const mockCreateResponse = getClassesControllerCreateV0ResponseMock();
  const mockUsersResponse = getUsersControllerFindAllV0ResponseMock();

  let createRequest: CreateClassDto | null = null;

  test.beforeEach(async ({ page, baseURL, apiURL }) => {
    createRequest = null;

    // Mock the response for the users controller find all endpoint
    await page.route(`${apiURL}${getUsersControllerFindAllV0Url()}`, (route) =>
      route.fulfill({
        ...jsonResponse,
        body: JSON.stringify(mockUsersResponse),
      }),
    );

    // Mock the response for the classes controller create endpoint
    await page.route(`${apiURL}${getClassesControllerCreateV0Url()}`, (route) => {
      createRequest = route.request().postDataJSON();

      return route.fulfill({
        ...jsonResponse,
        body: JSON.stringify(mockCreateResponse),
      });
    });

    await signInAndGotoPath(page, baseURL!, "/class/create");
  });

  test("can create a new class", async ({ page: pwPage, baseURL }) => {
    const page = await CreateClassForm.create(pwPage);

    const teacherId = mockUsersResponse[0].id;

    await page.inputs.className.fill("new class name");
    await page.inputs.teacherId.selectOption(teacherId.toString());
    await page.submitButton.click();

    await pwPage.waitForURL(`${baseURL}/class`);

    expect(createRequest).toEqual({
      name: "new class name",
      teacherId,
    });
  });
});
