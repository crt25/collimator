import { getSolutionsControllerFindCurrentAnalysesV0Url } from "@/api/collimator/generated/endpoints/solutions/solutions";
import { matchesCurrentAnalysesKey } from "../../currentAnalysesKey";

describe("matchesCurrentAnalysesKey", () => {
  it("matches every query-param variant for the task but nothing else", () => {
    const matches = matchesCurrentAnalysesKey(1, 2, 3);

    const defaultKey = getSolutionsControllerFindCurrentAnalysesV0Url(
      1,
      2,
      3,
      {},
    );
    const dashboardKey = getSolutionsControllerFindCurrentAnalysesV0Url(
      1,
      2,
      3,
      {
        studentSolutionsOnly: true,
        ignoreStarredSolutions: true,
      },
    );
    const otherTaskKey = getSolutionsControllerFindCurrentAnalysesV0Url(
      1,
      2,
      4,
      {},
    );

    expect(matches(defaultKey)).toBe(true);
    expect(matches(dashboardKey)).toBe(true);
    expect(matches(otherTaskKey)).toBe(false);
    expect(matches("/some/other/url")).toBe(false);
    expect(matches(42)).toBe(false);
    expect(matches(undefined)).toBe(false);
  });
});
