import { useCallback } from "react";
import { useRevalidateSolution } from "./useRevalidateSolution";
import { solutionsControllerCreateV0 } from "../../generated/endpoints/solutions/solutions";
import { ExistingSolution } from "../../models/solutions/existing-solution";

type Args = Parameters<typeof solutionsControllerCreateV0>;
type CreateSolutionType = (...args: Args) => Promise<ExistingSolution>;

const createAndTransform: CreateSolutionType = (...args) =>
  solutionsControllerCreateV0(...args).then(ExistingSolution.fromDto);

export const useCreateSolution = (): CreateSolutionType => {
  const revalidateSolution = useRevalidateSolution();

  return useCallback(
    (...args: Args) =>
      createAndTransform(...args).then((result) => {
        const classId = args[0];
        const sessionId = args[1];
        const taskId = args[2];
        const solutionId = result.id;

        revalidateSolution(classId, sessionId, taskId, solutionId, result);

        return result;
      }),
    [revalidateSolution],
  );
};
