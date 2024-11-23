import { useAdminUser } from "../authentication/authentication-helpers";
import {
  getClassesControllerFindAllV0Url,
  getClassesControllerFindOneV0Url,
} from "@/api/collimator/generated/endpoints/classes/classes";
import { expect, jsonResponse, mockUrlResponses, test } from "../helpers";
import {
  getClassesControllerFindAllV0ResponseMock,
  getClassesControllerFindOneV0ResponseMock,
  getClassesControllerUpdateV0ResponseMock,
} from "@/api/collimator/generated/endpoints/classes/classes.msw";
import { ClassForm } from "./class-form";
import {
  CreateClassDto,
  ExistingClassDto,
  ExistingClassWithTeacherDto,
  ExistingUserDto,
} from "@/api/collimator/generated/models";
import { getUsersControllerFindAllV0ResponseMock } from "@/api/collimator/generated/endpoints/users/users.msw";
import { getUsersControllerFindAllV0Url } from "@/api/collimator/generated/endpoints/users/users";
import { ClassListPageModel } from "./class-list-page-model";

test.describe("/class/{id}/edit", () => {
  const klass: ExistingClassWithTeacherDto =
    getClassesControllerFindOneV0ResponseMock();

  const mockUsersResponse = [
    ...getUsersControllerFindAllV0ResponseMock(),
    // include a user for the mock response
    {
      id: klass.teacher.id,
      name: "Teacher 1",
      email: "x@y.z",
      type: "TEACHER",
    } as ExistingUserDto,
  ];

  const updatedClass: ExistingClassDto = {
    ...getClassesControllerUpdateV0ResponseMock(),
    id: klass.id,
    teacherId: mockUsersResponse[0].id,
  };

  const mockClasses: ExistingClassWithTeacherDto[] = [
    ...getClassesControllerFindAllV0ResponseMock().slice(0, 9),
    klass,
  ];

  let updateRequest: CreateClassDto | null = null;

  test.beforeEach(async ({ context, page, baseURL, apiURL }) => {
    await useAdminUser(context);

    updateRequest = null;

    // mock classes response for list
    await page.route(
      `${apiURL}${getClassesControllerFindAllV0Url()}`,
      (route) =>
        route.fulfill({
          ...jsonResponse,
          body: JSON.stringify(mockClasses),
        }),
    );

    // mock users response for select
    await page.route(`${apiURL}${getUsersControllerFindAllV0Url()}`, (route) =>
      route.fulfill({
        ...jsonResponse,
        body: JSON.stringify(mockUsersResponse),
      }),
    );

    await mockUrlResponses(
      page,
      `${apiURL}${getClassesControllerFindOneV0Url(klass.id)}`,
      {
        get: klass,
        patch: updatedClass,
      },
      {
        patch: (request) => (updateRequest = request.postDataJSON()),
      },
    );

    await page.goto(`${baseURL}/class`);

    const list = await ClassListPageModel.create(page);
    await list.editItem(klass.id);
  });

  test("can update an existing class", async ({ page: pwPage, baseURL }) => {
    const page = await ClassForm.create(pwPage);

    // expect the form to be pre-filled

    expect(await page.inputs.className.inputValue()).toBe(klass.name);
    expect(await page.inputs.teacherId.inputValue()).toBe(
      klass.teacher.id.toString(),
    );

    await page.inputs.className.fill(updatedClass.name);
    await page.inputs.teacherId.selectOption(updatedClass.teacherId.toString());
    await page.submitButton.click();

    await pwPage.waitForURL(`${baseURL}/class`);

    expect(updateRequest).toEqual({
      name: updatedClass.name,
      teacherId: updatedClass.teacherId,
    });
  });
});
