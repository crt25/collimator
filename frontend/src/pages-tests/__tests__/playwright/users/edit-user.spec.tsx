import { expect, jsonResponse, mockUrlResponses, test } from "../helpers";
import { UserFormPageModel } from "./user-form-page-model";
import {
  getUsersControllerFindAllV0ResponseMock,
  getUsersControllerFindOneV0ResponseMock,
} from "@/api/collimator/generated/endpoints/users/users.msw";
import {
  getUsersControllerFindAllV0Url,
  getUsersControllerFindOneV0Url,
} from "@/api/collimator/generated/endpoints/users/users";
import {
  CreateUserDto,
  ExistingUserDto,
} from "@/api/collimator/generated/models";
import { UserListPageModel } from "./user-list-page-model";
import { useAdminUser } from "../authentication/authentication-helpers";

test.describe("/user/{id}/edit", () => {
  const user: ExistingUserDto = {
    ...getUsersControllerFindOneV0ResponseMock(),
    // Override the name and email as they may be generated wrong. (name can be null and email can be an arbitrary string)
    name: "Jane",
    email: "jane@example.com",
  };

  const updatedUser: ExistingUserDto & { name: string } = {
    ...getUsersControllerFindOneV0ResponseMock(),
    name: "Jane Doe",
    email: "jane.doe@example.com",
  };

  const mockUsers: ExistingUserDto[] = [
    ...getUsersControllerFindAllV0ResponseMock().slice(0, 9),
    user,
  ];

  let updateRequest: CreateUserDto | null = null;

  test.beforeEach(async ({ context, page, baseURL, apiURL }) => {
    await useAdminUser(context);

    updateRequest = null;

    // Mock user list response
    await page.route(`${apiURL}${getUsersControllerFindAllV0Url()}`, (route) =>
      route.fulfill({
        ...jsonResponse,
        body: JSON.stringify(mockUsers),
      }),
    );

    await mockUrlResponses(
      page,
      `${apiURL}${getUsersControllerFindOneV0Url(user.id)}`,
      {
        get: user,
        patch: updatedUser,
      },
      {
        patch: (request) => (updateRequest = request.postDataJSON()),
      },
    );

    await page.goto(`${baseURL}/user`);

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
      authenticationProvider: updatedUser.authenticationProvider,
    });
  });
});
