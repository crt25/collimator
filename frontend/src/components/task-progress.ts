import { ComponentProps } from "react";
import { Status } from "@chakra-ui/react";
import { ExistingStudentSolution } from "@/api/collimator/models/solutions/existing-student-solutions";
import { CurrentStudentAnalysis } from "@/api/collimator/models/solutions/current-student-analysis";

export enum TaskStatus {
  notStarted,
  incomplete,
  complete,
}

export type StatusColor = ComponentProps<
  typeof Status.Indicator
>["backgroundColor"];

export const getTaskStatus = (
  solutionToDisplay: ExistingStudentSolution | null,
  currentAnalysis: CurrentStudentAnalysis | null,
): TaskStatus => {
  if (!solutionToDisplay && !currentAnalysis) {
    return TaskStatus.notStarted;
  }

  const tests = solutionToDisplay?.tests ?? currentAnalysis?.tests;

  if (tests && tests.length > 0 && tests.every((test) => test.passed)) {
    return TaskStatus.complete;
  }

  return TaskStatus.incomplete;
};

export const getTaskStatusColor = (status: TaskStatus): StatusColor => {
  switch (status) {
    case TaskStatus.complete:
      return "success";
    case TaskStatus.incomplete:
      return "error";
    case TaskStatus.notStarted:
    default:
      return "neutral";
  }
};
