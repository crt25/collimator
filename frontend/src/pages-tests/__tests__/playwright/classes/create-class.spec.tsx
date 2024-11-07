import { signInAndGotoPath } from "../authentication/authentication-helpers";
import { getClassesControllerFindAllUrl } from "@/api/collimator/generated/endpoints/classes/classes";
import { expect, jsonResponse, mockUrlResponses, test } from "../helpers";
import {
  getClassesControllerCreateResponseMock,
  getClassesControllerFindAllResponseMock,
} from "@/api/collimator/generated/endpoints/classes/classes.msw";
import { ClassForm } from "./class-form";
import { CreateClassDto } from "@/api/collimator/generated/models";
import { getUsersControllerFindAllUrl } from "@/api/collimator/generated/endpoints/users/users";
import { getUsersControllerFindAllResponseMock } from "@/api/collimator/generated/endpoints/users/users.msw";
import { ClassListPageModel } from "./class-list-page-model";

test.describe("/class/create", () => {
  const mockCreateResponse = getClassesControllerCreateResponseMock();
  const mockUsersResponse = getUsersControllerFindAllResponseMock();

  let createRequest: CreateClassDto | null = null;

  test.beforeEach(async ({ page, baseURL, apiURL }) => {
    createRequest = null;

    await page.route(`${apiURL}${getUsersControllerFindAllUrl()}`, (route) =>
      route.fulfill({
        ...jsonResponse,
        body: JSON.stringify(mockUsersResponse),
      }),
    );

    await mockUrlResponses(
      page,
      `${apiURL}${getClassesControllerFindAllUrl()}`,
      {
        get: getClassesControllerFindAllResponseMock(),
        post: mockCreateResponse,
      },
      {
        post: (request) => (createRequest = request.postDataJSON()),
      },
    );

    await signInAndGotoPath(page, baseURL!, `/class`);

    const list = await ClassListPageModel.create(page);
    await list.createItem();
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
