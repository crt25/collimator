import { signInAndGotoPath } from "../authentication/authentication-helpers";
import { getClassesControllerFindOneUrl } from "@/api/collimator/generated/endpoints/classes/classes";
import { expect, jsonResponse, test } from "../helpers";
import {
  getClassesControllerFindOneResponseMock,
  getClassesControllerUpdateResponseMock,
} from "@/api/collimator/generated/endpoints/classes/classes.msw";
import { CreateClassForm } from "./create-class-form";
import {
  CreateClassDto,
  ExistingUserDto,
} from "@/api/collimator/generated/models";
import { getUsersControllerFindAllResponseMock } from "@/api/collimator/generated/endpoints/users/users.msw";
import { getUsersControllerFindAllUrl } from "@/api/collimator/generated/endpoints/users/users";

test.describe("/class/{id}/edit", () => {
  const mockResponse = getClassesControllerFindOneResponseMock();
  const mockUsersResponse = [
    ...getUsersControllerFindAllResponseMock(),
    // include a user for the mock response
    {
      id: mockResponse.teacher.id,
      name: "Teacher 1",
      email: "x@y.z",
      type: "TEACHER",
    } as ExistingUserDto,
  ];
  const updatedClass = {
    ...getClassesControllerUpdateResponseMock(),
    id: mockResponse.id,
    teacherId: mockUsersResponse[0].id,
  };

  let updateRequest: CreateClassDto | null = null;

  test.beforeEach(async ({ page, baseURL, apiURL }) => {
    updateRequest = null;

    // Mock the response for the users controller find all endpoint
    await page.route(`${apiURL}${getUsersControllerFindAllUrl()}`, (route) =>
      route.fulfill({
        ...jsonResponse,
        body: JSON.stringify(mockUsersResponse),
      }),
    );

    await page.route(
      `${apiURL}${getClassesControllerFindOneUrl(mockResponse.id)}`,
      (route) => {
        if (route.request().method() === "PATCH") {
          updateRequest = route.request().postDataJSON();

          // Mock the response for the classes controller update endpoint
          return route.fulfill({
            ...jsonResponse,
            body: JSON.stringify(updatedClass),
          });
        }

        // Mock the response for the classes controller get endpoint
        return route.fulfill({
          ...jsonResponse,
          body: JSON.stringify(mockResponse),
        });
      },
    );

    await signInAndGotoPath(page, baseURL!, `/class/${mockResponse.id}/edit`);
  });

  test("can update an existing class", async ({ page: pwPage, baseURL }) => {
    const page = await CreateClassForm.create(pwPage);

    // expect the form to be pre-filled

    expect(await page.inputs.className.inputValue()).toBe(mockResponse.name);
    expect(await page.inputs.teacherId.inputValue()).toBe(
      mockResponse.teacher.id.toString(),
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
