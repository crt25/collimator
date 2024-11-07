import { signInAndGotoPath } from "../authentication/authentication-helpers";
import { expect, mockUrlResponses, test } from "../helpers";
import { UserFormPageModel } from "./user-form-page-model";
import { getUsersControllerFindOneResponseMock } from "@/api/collimator/generated/endpoints/users/users.msw";
import { getUsersControllerFindOneUrl } from "@/api/collimator/generated/endpoints/users/users";
import { CreateUserDto } from "@/api/collimator/generated/models";

test.describe("/user/{id}/edit", () => {
  const mockResponse = {
    ...getUsersControllerFindOneResponseMock(),
    // Override the name and email as they may be generated wrong. (name can be null and email can be an arbitrary string)
    name: "Jane",
    email: "jane@example.com",
  };
  const updatedUser = {
    ...getUsersControllerFindOneResponseMock(),
    name: "Jane Doe",
    email: "jane.doe@example.com",
  };

  let updateRequest: CreateUserDto | null = null;

  test.beforeEach(async ({ page, baseURL, apiURL }) => {
    updateRequest = null;

    await mockUrlResponses(
      page,
      `${apiURL}${getUsersControllerFindOneUrl(mockResponse.id)}`,
      {
        get: mockResponse,
        patch: updatedUser,
      },
      {
        patch: (request) => (updateRequest = request.postDataJSON()),
      },
    );

    await signInAndGotoPath(page, baseURL!, `/user/${mockResponse.id}/edit`);
  });

  test("can update an existing user", async ({ page: pwPage, baseURL }) => {
    const page = await UserFormPageModel.create(pwPage);

    // expect the form to be pre-filled

    expect(await page.inputs.name.inputValue()).toBe(mockResponse.name);
    expect(await page.inputs.email.inputValue()).toBe(mockResponse.email);
    expect(await page.inputs.type.inputValue()).toBe(mockResponse.type);

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
