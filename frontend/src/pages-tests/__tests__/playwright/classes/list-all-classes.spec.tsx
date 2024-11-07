import { signInAndGotoPath } from "../authentication/authentication-helpers";
import { getClassesControllerFindAllV0Url } from "@/api/collimator/generated/endpoints/classes/classes";
import { expect, jsonResponse, test } from "../helpers";
import { getClassesControllerFindAllV0ResponseMock } from "@/api/collimator/generated/endpoints/classes/classes.msw";
import { classList } from "../selectors";

test.describe("/class", () => {
  const mockResponse = getClassesControllerFindAllV0ResponseMock().slice(0, 10);

  test.beforeEach(async ({ page, baseURL, apiURL }) => {
    // Mock the response for the classes controller find all endpoint
    await page.route(`${apiURL}${getClassesControllerFindAllV0Url()}`, (route) =>
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
});
