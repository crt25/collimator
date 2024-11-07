import { signInAndGotoPath } from "../authentication/authentication-helpers";
import { getClassesControllerCreateUrl } from "@/api/collimator/generated/endpoints/classes/classes";
import { expect, jsonResponse, test } from "../helpers";
import { getClassesControllerCreateResponseMock } from "@/api/collimator/generated/endpoints/classes/classes.msw";
import { ClassForm } from "./class-form";
import { CreateClassDto } from "@/api/collimator/generated/models";
import { getUsersControllerFindAllUrl } from "@/api/collimator/generated/endpoints/users/users";
import { getUsersControllerFindAllResponseMock } from "@/api/collimator/generated/endpoints/users/users.msw";

test.describe("/class/create", () => {
  const mockCreateResponse = getClassesControllerCreateResponseMock();
  const mockUsersResponse = getUsersControllerFindAllResponseMock();

  let createRequest: CreateClassDto | null = null;

  test.beforeEach(async ({ page, baseURL, apiURL }) => {
    createRequest = null;

    // Mock the response for the users controller find all endpoint
    await page.route(`${apiURL}${getUsersControllerFindAllUrl()}`, (route) =>
      route.fulfill({
        ...jsonResponse,
        body: JSON.stringify(mockUsersResponse),
      }),
    );

    // Mock the response for the classes controller create endpoint
    await page.route(`${apiURL}${getClassesControllerCreateUrl()}`, (route) => {
      createRequest = route.request().postDataJSON();

      return route.fulfill({
        ...jsonResponse,
        body: JSON.stringify(mockCreateResponse),
      });
    });

    await signInAndGotoPath(page, baseURL!, "/class/create");
  });

  test("can create a new class", async ({ page: pwPage, baseURL }) => {
    const page = await ClassForm.create(pwPage);

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
