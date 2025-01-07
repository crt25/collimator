import { useCallback } from "react";
import { solutionsControllerCreateV0 } from "../../generated/endpoints/solutions/solutions";
import { ExistingSolution } from "../../models/solutions/existing-solution";
import { useAuthenticationOptions } from "../authentication/useAuthenticationOptions";
import { CreateSolutionDto } from "../../generated/models";
import { useRevalidateSolution } from "./useRevalidateSolution";

type CreateSolutionType = (
  classId: number,
  sessionId: number,
  taskId: number,
  createSolutionDto: CreateSolutionDto,
) => Promise<ExistingSolution>;

const createAndTransform = (
  options: RequestInit,
  classId: number,
  sessionId: number,
  taskId: number,
  createSolutionDto: CreateSolutionDto,
): ReturnType<CreateSolutionType> =>
  solutionsControllerCreateV0(
    classId,
    sessionId,
    taskId,
    createSolutionDto,
    options,
  ).then(ExistingSolution.fromDto);

export const useCreateSolution = (): CreateSolutionType => {
  const revalidateSolution = useRevalidateSolution();
  const authOptions = useAuthenticationOptions();

  return useCallback<CreateSolutionType>(
    (classId, sessionId, taskId, createSolutionDto) =>
      createAndTransform(
        authOptions,
        classId,
        sessionId,
        taskId,
        createSolutionDto,
      ).then((result) => {
        const solutionId = result.id;

        revalidateSolution(classId, sessionId, taskId, solutionId, result);

        return result;
      }),
    [authOptions, revalidateSolution],
  );
};
