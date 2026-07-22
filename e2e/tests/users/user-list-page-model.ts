/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Page } from "@playwright/test";
import { userList } from "../../selectors";
import { ListPageModel } from "../../page-models/list-page-model";
import { getItemIdFromTableTestId } from "../../helpers";
import { UserFormPageModel } from "./user-form-page-model";
import { UserType } from "@/api/collimator/generated/models";

export class UserListPageModel extends ListPageModel {
  protected constructor(page: Page) {
    super(page, "user");
  }

  getNameElementByName(name: string) {
    return this.page
      .locator(`[data-testid^='${this.itemPrefix}'][data-testid$='-name']`)
      .getByText(name);
  }

  async getIdByName(name: string) {
    // The user list is paginated (10 rows per page). Once the seeded users plus
    // the users created by earlier tests fill the first page, a newly created
    // user's row lands on a later page and never appears in the DOM — the
    // lookup then times out deterministically. Filter the list by the user's
    // name first (like a real admin would) so the row is always on the visible
    // page. The filter also keeps the row visible for follow-up row actions
    // (e.g. editItem); navigating away resets it.
    await this.page.getByTestId("table-search-input").fill(name);

    const elLocator = this.getNameElementByName(name);

    // The list also revalidates asynchronously after a creation, so the row can
    // be absent for a moment even once the list container is present. Wait for
    // the row explicitly (with a generous but sub-test-timeout budget) before
    // reading its id, so a slow revalidation surfaces as a clear "row never
    // appeared" failure instead of evaluate() silently blocking for the full
    // 160s test timeout.
    await elLocator.waitFor({ state: "visible", timeout: 60_000 });

    return getItemIdFromTableTestId(
      await elLocator.evaluate((el) =>
        el.closest("[data-testid$=-name]")!.getAttribute("data-testid"),
      ),
    );
  }

  getName(itemId: number | string) {
    return this.page.getByTestId(`${this.itemPrefix}-${itemId}-name`);
  }

  viewItem(itemId: number | string): Promise<void> {
    return this.getName(itemId).click();
  }

  static async create(page: Page) {
    await page.waitForSelector(userList);

    return new UserListPageModel(page);
  }

  /**
   * Creates a user via the UI and returns the created user's ID.
   * Navigates to the create form, fills it, submits, and returns to the list.
   */
  async createUser(
    name: string,
    email: string,
    type: UserType,
  ): Promise<number> {
    await this.createItem();

    const form = await UserFormPageModel.create(this.page);
    await form.inputs.name.fill(name);
    await form.inputs.email.fill(email);
    await form.setUserType(type);
    await form.submitButton.click();

    // Wait for navigation back to list
    await this.page.waitForSelector(userList);

    return this.getIdByName(name);
  }
}
