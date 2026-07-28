import { useCallback } from "react";
import { useSWRConfig } from "swr";
import {
  getSolutionsControllerFindCurrentAnalysesV0Url,
  solutionsControllerPatchStudentReferenceSolutionV0,
} from "../../generated/endpoints/solutions/solutions";
import { CurrentStudentAnalysis } from "../../models/solutions/current-student-analysis";
import { useAuthenticationOptions } from "../authentication/useAuthenticationOptions";
import { GetCurrentAnalysisReturnType } from "./useCurrentSessionTaskSolutions";
import { useRevalidateSolutionList } from "./useRevalidateSolutionList";

type PatchStudentReferenceSolution = (
  classId: number,
  sessionId: number,
  taskId: number,
  studentId: number,
  solutionHash: string,
  isReference: boolean,
) => Promise<void>;

export const usePatchStudentReferenceSolution =
  (): PatchStudentReferenceSolution => {
    const revalidateSolutionList = useRevalidateSolutionList();
    const { mutate, cache } = useSWRConfig();
    const authOptions = useAuthenticationOptions();

    return useCallback<PatchStudentReferenceSolution>(
      (classId, sessionId, taskId, studentId, solutionHash, isReference) =>
        solutionsControllerPatchStudentReferenceSolutionV0(
          classId,
          sessionId,
          taskId,
          studentId,
          { isReference, solutionHash },
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
            mutate(
              key,
              cachedData.map((analysis) =>
                analysis instanceof CurrentStudentAnalysis &&
                analysis.studentId === studentId &&
                analysis.solutionHash === solutionHash
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
