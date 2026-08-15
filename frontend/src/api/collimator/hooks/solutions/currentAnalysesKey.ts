import { getSolutionsControllerFindCurrentAnalysesV0Url } from "../../generated/endpoints/solutions/solutions";

/**
 * SWR caches the current-analyses list per query-param variant - the analysis
 * dashboard uses studentSolutionsOnly / ignoreStarredSolutions, other consumers
 * use the default. Returns a key matcher for a given class/session/task that
 * matches every such variant (by URL prefix), so a single mutate/revalidate
 * covers all of them. Keeping this in one place stops the two callers
 * (useRevalidateSolutionList, usePatchStudentReferenceSolutions) from drifting.
 */
export const matchesCurrentAnalysesKey =
  (classId: number, sessionId: number, taskId: number) =>
  (key: unknown): boolean => {
    const base = getSolutionsControllerFindCurrentAnalysesV0Url(
      classId,
      sessionId,
      taskId,
      {},
    );

    return typeof key === "string" && key.startsWith(base);
  };
