import { useAdminUser } from "../authentication/authentication-helpers";
import { getClassesControllerFindAllV0Url } from "@/api/collimator/generated/endpoints/classes/classes";
import { expect, jsonResponse, mockUrlResponses, test } from "../helpers";
import {
  getClassesControllerCreateV0ResponseMock,
  getClassesControllerFindAllV0ResponseMock,
} from "@/api/collimator/generated/endpoints/classes/classes.msw";
import { ClassFormPageModel } from "./class-form-page-model";
import {
  CreateClassDto,
  ExistingUserDto,
  UserType,
} from "@/api/collimator/generated/models";
import { getUsersControllerFindAllV0Url } from "@/api/collimator/generated/endpoints/users/users";
import { getUsersControllerFindAllV0ResponseMock } from "@/api/collimator/generated/endpoints/users/users.msw";
import { ClassListPageModel } from "./class-list-page-model";

test.describe("/class/create", () => {
  const mockCreateResponse = getClassesControllerCreateV0ResponseMock();
  const mockUsersResponse = [
    ...getUsersControllerFindAllV0ResponseMock(),
    {
      id: 0,
      email: "jane@doe.com",
      name: "Jane Doe",
      type: UserType.TEACHER,
    } as ExistingUserDto,
  ];

  let createRequest: CreateClassDto | null = null;

  test.beforeEach(async ({ page, baseURL, apiURL, context }) => {
    await useAdminUser(context);

    createRequest = null;

    await page.route(`${apiURL}${getUsersControllerFindAllV0Url()}`, (route) =>
      route.fulfill({
        ...jsonResponse,
        body: JSON.stringify(mockUsersResponse),
      }),
    );

    await mockUrlResponses(
      page,
      `${apiURL}${getClassesControllerFindAllV0Url()}`,
      {
        get: getClassesControllerFindAllV0ResponseMock(),
        post: mockCreateResponse,
      },
      {
        post: (request) => (createRequest = request.postDataJSON()),
      },
    );

    await page.goto(`${baseURL}/class`);

    const list = await ClassListPageModel.create(page);
    await list.createItem();
  });

  test.only("can create a new class", async ({ page: pwPage, baseURL }) => {
    const page = await ClassFormPageModel.create(pwPage);

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
