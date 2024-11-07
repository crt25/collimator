import { signInAndGotoPath } from "../authentication/authentication-helpers";
import { expect, jsonResponse, mockUrlResponses, test } from "../helpers";
import { UserFormPageModel } from "./user-form-page-model";
import {
  getUsersControllerFindAllResponseMock,
  getUsersControllerFindOneResponseMock,
} from "@/api/collimator/generated/endpoints/users/users.msw";
import {
  getUsersControllerFindAllUrl,
  getUsersControllerFindOneUrl,
} from "@/api/collimator/generated/endpoints/users/users";
import {
  CreateUserDto,
  ExistingUserDto,
} from "@/api/collimator/generated/models";
import { UserListPageModel } from "./user-list-page-model";

test.describe("/user/{id}/edit", () => {
  const user: ExistingUserDto = {
    ...getUsersControllerFindOneResponseMock(),
    // Override the name and email as they may be generated wrong. (name can be null and email can be an arbitrary string)
    name: "Jane",
    email: "jane@example.com",
  };

  const updatedUser: ExistingUserDto & { name: string } = {
    ...getUsersControllerFindOneResponseMock(),
    name: "Jane Doe",
    email: "jane.doe@example.com",
  };

  const mockUsers: ExistingUserDto[] = [
    ...getUsersControllerFindAllResponseMock().slice(0, 9),
    user,
  ];

  let updateRequest: CreateUserDto | null = null;

  test.beforeEach(async ({ page, baseURL, apiURL }) => {
    updateRequest = null;

    // Mock user list response
    await page.route(`${apiURL}${getUsersControllerFindAllUrl()}`, (route) =>
      route.fulfill({
        ...jsonResponse,
        body: JSON.stringify(mockUsers),
      }),
    );

    await mockUrlResponses(
      page,
      `${apiURL}${getUsersControllerFindOneUrl(user.id)}`,
      {
        get: user,
        patch: updatedUser,
      },
      {
        patch: (request) => (updateRequest = request.postDataJSON()),
      },
    );

    await signInAndGotoPath(page, baseURL!, `/user`);

    const list = await UserListPageModel.create(page);
    await list.editItem(user.id);
  });

  test("can update an existing user", async ({ page: pwPage, baseURL }) => {
    const page = await UserFormPageModel.create(pwPage);

    // expect the form to be pre-filled

    expect(await page.inputs.name.inputValue()).toBe(user.name);
    expect(await page.inputs.email.inputValue()).toBe(user.email);
    expect(await page.inputs.type.inputValue()).toBe(user.type);

    await page.inputs.name.fill(updatedUser.name);
    await page.inputs.email.fill(updatedUser.email);
    await page.inputs.type.selectOption(updatedUser.type);
    await page.submitButton.click();

    await pwPage.waitForURL(`${baseURL}/user`);

    expect(updateRequest).toEqual({
      name: updatedUser.name,
      email: updatedUser.email,
      type: updatedUser.type,
    });
  });
});
