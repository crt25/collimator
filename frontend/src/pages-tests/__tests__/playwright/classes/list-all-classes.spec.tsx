import { signInAndGotoPath } from "../authentication/authentication-helpers";
import {
  getClassesControllerFindAllV0Url,
  getClassesControllerFindOneV0Url,
} from "@/api/collimator/generated/endpoints/classes/classes";
import { expect, jsonResponse, mockUrlResponses, test } from "../helpers";
import { getClassesControllerFindAllV0ResponseMock } from "@/api/collimator/generated/endpoints/classes/classes.msw";
import { classList } from "../selectors";
import { ClassListPageModel } from "./class-list-page-model";
import { ExistingClassWithTeacherDto } from "@/api/collimator/generated/models";

test.describe("/class", () => {
  const klass: ExistingClassWithTeacherDto = {
    id: 1,
    name: "Class 1",
    teacher: {
      id: 1,
      name: "Teacher 1",
    },
  };

  let mockResponse: ExistingClassWithTeacherDto[] = [];

  test.beforeEach(async ({ page, baseURL, apiURL }) => {
    mockResponse = [
      ...getClassesControllerFindAllV0ResponseMock().slice(0, 9),
      klass,
    ];

    // Mock the response for the classes controller find all endpoint
    await page.route(
      `${apiURL}${getClassesControllerFindAllV0Url()}`,
      (route) =>
        route.fulfill({
          ...jsonResponse,
          body: JSON.stringify(mockResponse),
        }),
    );

    await signInAndGotoPath(page, baseURL!, "/class");
    await page.waitForSelector(classList);
  });

  test("renders the fetched items", async ({ page }) => {
    expect(page.locator(classList).locator("tbody tr")).toHaveCount(
      mockResponse.length,
    );
  });

  test("can delete listed item", async ({ page: pwPage, apiURL }) => {
    const page = await ClassListPageModel.create(pwPage);
    let wasDeleted = false;

    await mockUrlResponses(
      pwPage,
      `${apiURL}${getClassesControllerFindOneV0Url(klass.id)}`,
      {
        get: klass,
        delete: klass,
      },
      {
        delete: () => {
          wasDeleted = true;
          mockResponse = mockResponse.filter((u) => u.id !== klass.id);
        },
      },
    );

    await page.deleteItem(klass.id);

    // Wait for the deletion to be reflected in the UI
    await expect(page.getItemActions(klass.id)).toHaveCount(0);

    // check that our delete handler was called
    expect(wasDeleted).toBe(true);
  });
});
