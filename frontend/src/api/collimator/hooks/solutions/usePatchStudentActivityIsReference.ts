import { useCallback } from "react";
import { useSWRConfig } from "swr";
import {
  getSolutionsControllerFindCurrentAnalysesV0Url,
  solutionsControllerPatchStudentActivityIsReferenceV0,
} from "../../generated/endpoints/solutions/solutions";
import { useAuthenticationOptions } from "../authentication/useAuthenticationOptions";
import { PatchStudentSolutionIsReferenceDto } from "../../generated/models";
import { CurrentStudentAnalysis } from "../../models/solutions/current-student-analysis";
import { GetCurrentAnalysisReturnType } from "./useCurrentSessionTaskSolutions";
import { useRevalidateSolutionList } from "./useRevalidateSolutionList";

type PatchActivityType = (
  classId: number,
  sessionId: number,
  taskId: number,
  studentId: number,
  patchDto: PatchStudentSolutionIsReferenceDto,
) => Promise<void>;

export const usePatchStudentActivityIsReference = (): PatchActivityType => {
  const revalidateSolutionList = useRevalidateSolutionList();
  const { mutate, cache } = useSWRConfig();
  const authOptions = useAuthenticationOptions();

  return useCallback<PatchActivityType>(
    (classId, sessionId, taskId, studentId, patchDto) =>
      solutionsControllerPatchStudentActivityIsReferenceV0(
        classId,
        sessionId,
        taskId,
        studentId,
        patchDto,
        authOptions,
      ).then(() => {
        revalidateSolutionList(classId, sessionId, taskId);

        // Optimistically update the analysis list cache
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
            cachedData.map((a) =>
              a instanceof CurrentStudentAnalysis &&
              !a.isStudentSolution &&
              a.studentId === studentId
                ? a.withIsReference(patchDto.isReference)
                : a,
            ),
          );
        }
      }),
    [authOptions, revalidateSolutionList, cache, mutate],
  );
};
