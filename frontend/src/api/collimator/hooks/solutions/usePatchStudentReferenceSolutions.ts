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
    const { mutate, cache } = useSWRConfig();
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
          revalidateSolutionList(classId, sessionId, taskId);

          const key = getSolutionsControllerFindCurrentAnalysesV0Url(
            classId,
            sessionId,
            taskId,
            {},
          );
          const cachedData: GetCurrentAnalysisReturnType | undefined =
            cache.get(key)?.data;

          if (cachedData !== undefined) {
            const solutionHashSet = new Set(solutionHashes);
            mutate(
              key,
              cachedData.map((analysis) =>
                analysis instanceof CurrentStudentAnalysis &&
                analysis.studentId === studentId &&
                solutionHashSet.has(analysis.solutionHash)
                  ? analysis.withIsReference(isReference)
                  : analysis,
              ),
              { revalidate: false },
            );
          }
        }),
      [authOptions, cache, mutate, revalidateSolutionList],
    );
  };
