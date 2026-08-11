import { useCallback } from "react";
import { useSWRConfig } from "swr";
import {
  getSolutionsControllerFindCurrentAnalysesV0Url,
  solutionsControllerPatchStudentReferenceSolutionsV0,
} from "../../generated/endpoints/solutions/solutions";
import { CurrentStudentAnalysis } from "../../models/solutions/current-student-analysis";
import { useAuthenticationOptions } from "../authentication/useAuthenticationOptions";
import { GetCurrentAnalysisReturnType } from "./useCurrentSessionTaskSolutions";
import { useRevalidateSolutionList } from "./useRevalidateSolutionList";

type PatchStudentReferenceSolutions = (
  classId: number,
  sessionId: number,
  taskId: number,
  studentId: number,
  solutionHashes: string[],
  isReference: boolean,
) => Promise<void>;

export const usePatchStudentReferenceSolutions =
  (): PatchStudentReferenceSolutions => {
    const revalidateSolutionList = useRevalidateSolutionList();
    const { mutate } = useSWRConfig();
    const authOptions = useAuthenticationOptions();

    return useCallback<PatchStudentReferenceSolutions>(
      (classId, sessionId, taskId, studentId, solutionHashes, isReference) =>
        solutionsControllerPatchStudentReferenceSolutionsV0(
          classId,
          sessionId,
          taskId,
          studentId,
          { isReference, solutionHashes },
          undefined,
          authOptions,
        ).then(() => {
          const base = getSolutionsControllerFindCurrentAnalysesV0Url(
            classId,
            sessionId,
            taskId,
            {},
          );
          const solutionHashSet = new Set(solutionHashes);

          // Optimistically flag the starred solutions across every cached
          // variant of the current-analyses list (the analysis dashboard uses
          // a distinct query key), before the revalidation below.
          mutate(
            (key: unknown) => typeof key === "string" && key.startsWith(base),
            (cachedData?: GetCurrentAnalysisReturnType) =>
              cachedData
                ? cachedData.map((analysis) =>
                    analysis instanceof CurrentStudentAnalysis &&
                    analysis.studentId === studentId &&
                    solutionHashSet.has(analysis.solutionHash)
                      ? analysis.withIsReference(isReference)
                      : analysis,
                  )
                : cachedData,
            { revalidate: false },
          );

          revalidateSolutionList(classId, sessionId, taskId);
        }),
      [authOptions, mutate, revalidateSolutionList],
    );
  };
