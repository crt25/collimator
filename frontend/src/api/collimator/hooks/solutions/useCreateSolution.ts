import { useCallback } from "react";
import { fetchApi } from "@/api/fetch";
import {
  getSolutionsControllerCreateStudentSolutionV0Url,
  solutionsControllerCreateStudentSolutionV0,
} from "../../generated/endpoints/solutions/solutions";
import { useAuthenticationOptions } from "../authentication/useAuthenticationOptions";
import { CreateSolutionDto } from "../../generated/models";
import { ExistingStudentSolution } from "../../models/solutions/existing-student-solutions";
import { useRevalidateSolution } from "./useRevalidateSolution";

type CreateSolutionType = (
  classId: number,
  sessionId: number,
  taskId: number,
  createSolutionDto: CreateSolutionDto,
) => Promise<ExistingStudentSolution>;

type CreateStudentSolutionResponse = Awaited<
  ReturnType<typeof solutionsControllerCreateStudentSolutionV0>
>;

const solutionsControllerCreate = async (
  classId: number,
  sessionId: number,
  taskId: number,
  createSolutionDto: CreateSolutionDto,
  options?: RequestInit,
): Promise<CreateStudentSolutionResponse> => {
  const formData = new FormData();
  formData.append("tests", JSON.stringify(createSolutionDto.tests));
  formData.append("file", createSolutionDto.file);

  return fetchApi<Promise<CreateStudentSolutionResponse>>(
    getSolutionsControllerCreateStudentSolutionV0Url(
      classId,
      sessionId,
      taskId,
    ),
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
  ).then(ExistingStudentSolution.fromDto);

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
