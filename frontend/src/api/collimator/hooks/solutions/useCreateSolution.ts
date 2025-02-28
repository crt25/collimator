import { useCallback } from "react";
import { fetchApi } from "@/api/fetch";
import { getSolutionsControllerCreateV0Url } from "../../generated/endpoints/solutions/solutions";
import { ExistingSolution } from "../../models/solutions/existing-solution";
import { useAuthenticationOptions } from "../authentication/useAuthenticationOptions";
import { CreateSolutionDto, ExistingSolutionDto } from "../../generated/models";
import { useRevalidateSolution } from "./useRevalidateSolution";

type CreateSolutionType = (
  classId: number,
  sessionId: number,
  taskId: number,
  createSolutionDto: CreateSolutionDto,
) => Promise<ExistingSolution>;

const solutionsControllerCreate = async (
  classId: number,
  sessionId: number,
  taskId: number,
  createSolutionDto: CreateSolutionDto,
  options?: RequestInit,
): Promise<ExistingSolutionDto> => {
  const formData = new FormData();
  formData.append("tests", JSON.stringify(createSolutionDto.tests));
  formData.append("file", createSolutionDto.file);

  return fetchApi<Promise<ExistingSolutionDto>>(
    getSolutionsControllerCreateV0Url(classId, sessionId, taskId),
    {
      ...options,
      method: "POST",
      body: formData,
    },
  );
};

const createAndTransform = (
  options: RequestInit,
  classId: number,
  sessionId: number,
  taskId: number,
  createSolutionDto: CreateSolutionDto,
): ReturnType<CreateSolutionType> =>
  solutionsControllerCreate(
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
