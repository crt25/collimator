import { UpdateReferenceSolutionDto } from "@/api/collimator/generated/models";
import { TaskFormSubmission } from "@/components/task/TaskForm";

type ReferenceSolutionResult = [UpdateReferenceSolutionDto[], Blob[]];
type ExistingSolutions = Array<UpdateReferenceSolutionDto & { solution: Blob }>;

export const getInitialSolutionOnly = (
  taskSubmission: TaskFormSubmission,
): ReferenceSolutionResult => {
  const { initialSolution, initialSolutionFile } = taskSubmission;

  if (initialSolution && initialSolutionFile) {
    return [[initialSolution], [initialSolutionFile]];
  }

  return [[], []];
};

export const appendOrUpdateInitialSolution = (
  taskSubmission: TaskFormSubmission,
  existingSolutions: ExistingSolutions,
): ReferenceSolutionResult => {
  const { initialSolution, initialSolutionFile } = taskSubmission;

  if (initialSolution && initialSolutionFile) {
    const nonInitialSolutions = existingSolutions.filter((s) => !s.isInitial);

    return [
      [...nonInitialSolutions, initialSolution],
      [...nonInitialSolutions.map((s) => s.solution), initialSolutionFile],
    ];
  }

  return [
    [...existingSolutions],
    [...existingSolutions.map((s) => s.solution)],
  ];
};
