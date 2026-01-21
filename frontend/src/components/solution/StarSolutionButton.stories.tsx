import { ExistingStudentSolution } from "@/api/collimator/models/solutions/existing-student-solutions";
import StarSolutionButton from "./StarSolutionButton";

type Args = Parameters<typeof StarSolutionButton>[0];

export default {
  component: StarSolutionButton,
};

export const Default = {
  args: {
    classId: 1,
    solution: {
      id: 1,
      sessionId: 1,
      taskId: 1,
      isReference: false,
    } as ExistingStudentSolution,
    testId: "star-solution-button",
  } as Args,
};

export const ReferenceSolution = {
  args: {
    classId: 1,
    solution: {
      id: 1,
      sessionId: 1,
      taskId: 1,
      isReference: true,
    } as ExistingStudentSolution,
    testId: "star-solution-button",
  } as Args,
};
