import { expect, mockUrlResponses, test } from "../helpers";
import { UserFormPageModel } from "./user-form-page-model";
import {
  AuthenticationProvider,
  CreateUserDto,
  UserType,
} from "@/api/collimator/generated/models";
import { getUsersControllerFindAllV0Url } from "@/api/collimator/generated/endpoints/users/users";
import {
  getUsersControllerCreateV0ResponseMock,
  getUsersControllerFindAllV0ResponseMock,
} from "@/api/collimator/generated/endpoints/users/users.msw";
import { UserListPageModel } from "./user-list-page-model";
import { useAdminUser } from "../authentication/authentication-helpers";

test.describe("/user/create", () => {
  const mockCreateResponse = getUsersControllerCreateV0ResponseMock();

  let createRequest: CreateUserDto | null = null;

  test.beforeEach(async ({ context, page, baseURL, apiURL }) => {
    await useAdminUser(context);

    createRequest = null;

    await mockUrlResponses(
      page,
      `${apiURL}${getUsersControllerFindAllV0Url()}`,
      {
        get: getUsersControllerFindAllV0ResponseMock(),
        post: mockCreateResponse,
      },
      {
        post: (request) => (createRequest = request.postDataJSON()),
      },
    );

    await page.goto(`${baseURL}/user`);

    const list = await UserListPageModel.create(page);
    await list.createItem();
  });

  test("can create a new teacher", async ({ page: pwPage, baseURL }) => {
    const page = await UserFormPageModel.create(pwPage);

    await page.inputs.name.fill("Jane Doe");
    await page.inputs.email.fill("jane.doe@example.com");
    await page.inputs.type.selectOption(UserType.TEACHER);
    await page.submitButton.click();

    await pwPage.waitForURL(`${baseURL}/user`);

    expect(createRequest).toEqual({
      name: "Jane Doe",
      email: "jane.doe@example.com",
      type: UserType.TEACHER,
      authenticationProvider: AuthenticationProvider.MICROSOFT,
    });
  });

  test("can create a new admin", async ({ page: pwPage, baseURL }) => {
    const page = await UserFormPageModel.create(pwPage);

    await page.inputs.name.fill("Jane Doe");
    await page.inputs.email.fill("jane.doe@example.com");
    await page.inputs.type.selectOption(UserType.ADMIN);
    await page.submitButton.click();

    await pwPage.waitForURL(`${baseURL}/user`);

    expect(createRequest).toEqual({
      name: "Jane Doe",
      email: "jane.doe@example.com",
      type: UserType.ADMIN,
      authenticationProvider: AuthenticationProvider.MICROSOFT,
    });
  });
});
