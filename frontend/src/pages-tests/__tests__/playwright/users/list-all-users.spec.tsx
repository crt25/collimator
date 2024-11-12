import { ExistingUserDto } from "@/api/collimator/generated/models";
import { expect, jsonResponse, mockUrlResponses, test } from "../helpers";
import { userList } from "../selectors";
import {
  getUsersControllerFindAllV0Url,
  getUsersControllerFindOneV0Url,
} from "@/api/collimator/generated/endpoints/users/users";
import { getUsersControllerFindAllV0ResponseMock } from "@/api/collimator/generated/endpoints/users/users.msw";
import { UserListPageModel } from "./user-list-page-model";
import { useAdminUser } from "../authentication/authentication-helpers";

test.describe("/user", () => {
  const user: ExistingUserDto = {
    id: 1,
    name: "Jane Doe",
    email: "jane@doe.com",
    type: "TEACHER",
  };
  let mockResponse: ExistingUserDto[] = [];

  test.beforeEach(async ({ context, page, baseURL, apiURL }) => {
    await useAdminUser(context);

    mockResponse = [
      ...getUsersControllerFindAllV0ResponseMock().slice(0, 9),
      user,
    ];

    // Mock the response for the users controller find all endpoint
    await page.route(`${apiURL}${getUsersControllerFindAllV0Url()}`, (route) =>
      route.fulfill({
        ...jsonResponse,
        body: JSON.stringify(mockResponse),
      }),
    );

    await page.goto(`${baseURL}/user`);
    await page.waitForSelector(userList);
  });

  test("renders the fetched items", async ({ page }) => {
    expect(page.locator(userList).locator("tbody tr")).toHaveCount(
      mockResponse.length,
    );
  });

  test("can delete listed item", async ({ page: pwPage, apiURL }) => {
    const page = await UserListPageModel.create(pwPage);

    await mockUrlResponses(
      pwPage,
      `${apiURL}${getUsersControllerFindOneV0Url(user.id)}`,
      {
        get: user,
        delete: user,
      },
      {
        delete: () => {
          mockResponse = mockResponse.filter((u) => u.id !== user.id);
        },
      },
    );

    await page.deleteItem(user.id);

    // Wait for the deletion to be reflected in the UI
    await expect(page.getItemActions(user.id)).toHaveCount(0);
  });
});
