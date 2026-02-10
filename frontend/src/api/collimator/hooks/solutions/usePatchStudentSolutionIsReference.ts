import { useCallback } from "react";
import { useSWRConfig } from "swr";
import {
  getSolutionsControllerFindCurrentAnalysesV0Url,
  solutionsControllerPatchStudentSolutionIsReferenceV0,
} from "../../generated/endpoints/solutions/solutions";
import { useAuthenticationOptions } from "../authentication/useAuthenticationOptions";
import { PatchStudentSolutionIsReferenceDto } from "../../generated/models";
import { CurrentStudentAnalysis } from "../../models/solutions/current-student-analysis";
import { useRevalidateStudentSolution } from "./useRevalidateStudentSolution";
import { GetCurrentAnalysisReturnType } from "./useCurrentSessionTaskSolutions";
import { useRevalidateSolutionList } from "./useRevalidateSolutionList";

type PatchSolutionType = (
  classId: number,
  sessionId: number,
  taskId: number,
  studentSolutionId: number,
  patchSolutionDto: PatchStudentSolutionIsReferenceDto,
) => Promise<void>;

const patchAndTransform = (
  options: RequestInit,
  classId: number,
  sessionId: number,
  taskId: number,
  studentSolutionId: number,
  patchSolutionDto: PatchStudentSolutionIsReferenceDto,
): Promise<void> =>
  solutionsControllerPatchStudentSolutionIsReferenceV0(
    classId,
    sessionId,
    taskId,
    studentSolutionId,
    patchSolutionDto,
    {},
    options,
  );

export const usePatchStudentSolutionIsReference = (): PatchSolutionType => {
  const revalidateStudentSolution = useRevalidateStudentSolution();
  const revalidateSolutionList = useRevalidateSolutionList();
  const { mutate, cache } = useSWRConfig();
  const authOptions = useAuthenticationOptions();

  return useCallback<PatchSolutionType>(
    (classId, sessionId, taskId, studentSolutionId, patchSolutionDto) =>
      patchAndTransform(
        authOptions,
        classId,
        sessionId,
        taskId,
        studentSolutionId,
        patchSolutionDto,
      ).then(() => {
        revalidateStudentSolution(
          classId,
          sessionId,
          taskId,
          studentSolutionId,
        );

        revalidateSolutionList(classId, sessionId, taskId);

        // mutate the analysis list locally but do not revalidate it
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
              a.studentSolutionId === studentSolutionId
                ? a.withIsReference(patchSolutionDto.isReference)
                : a,
            ),
          );
        }
      }),
    [
      authOptions,
      revalidateStudentSolution,
      revalidateSolutionList,
      cache,
      mutate,
    ],
  );
};
