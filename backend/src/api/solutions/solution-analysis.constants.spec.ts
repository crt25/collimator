import {
  maximumNumberOfAnalysisRetries,
  permanentlyFailedAnalysisCount,
} from "./solution-analysis.constants";

describe("solution analysis constants", () => {
  it("keeps permanent failures above the retry ceiling", () => {
    expect(permanentlyFailedAnalysisCount).toBeGreaterThan(
      maximumNumberOfAnalysisRetries,
    );
  });
});
