import { ComponentProps, useMemo } from "react";
import { MessageDescriptor, useIntl } from "react-intl";
import { HStack, Link, Status } from "@chakra-ui/react";
import { ExistingStudentSolution } from "@/api/collimator/models/solutions/existing-student-solutions";
import { CurrentStudentAnalysis } from "@/api/collimator/models/solutions/current-student-analysis";
import { ProgressMessages } from "@/i18n/progress-messages";

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

  const analysisTests = currentAnalysis?.tests.length
    ? currentAnalysis.tests
    : null;

  const solutionTests = solutionToDisplay?.tests.length
    ? solutionToDisplay.tests
    : null;

  // always prefer solutionTests over analysisTest if they exist because analysisTests
  // are triggered on student activities and this can lead to an incorrect task status
  // in the following case:
  // 1. student completes successfully the task and submits
  // 2. student edits the task, and now the tests fail
  // 3. we still want to see that the student completed it correctly
  const tests = solutionTests ?? analysisTests;

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

export const getTaskStatusMessage = (status: TaskStatus): MessageDescriptor => {
  switch (status) {
    case TaskStatus.complete:
      return ProgressMessages.completeStatus;
    case TaskStatus.incomplete:
      return ProgressMessages.incompleteStatus;
    case TaskStatus.notStarted:
    default:
      return ProgressMessages.notStartedStatus;
  }
};

const TaskProgress = ({
  solutions,
  currentAnalysis,
  href,
}: {
  solutions: ExistingStudentSolution[] | undefined;
  currentAnalysis: CurrentStudentAnalysis | null;
  href?: string;
}) => {
  const intl = useIntl();

  const solutionToDisplay = useMemo(
    () => ExistingStudentSolution.findSolutionToDisplay(solutions),
    [solutions],
  );

  const status = useMemo(
    () => getTaskStatus(solutionToDisplay, currentAnalysis),
    [solutionToDisplay, currentAnalysis],
  );

  const color = useMemo(() => getTaskStatusColor(status), [status]);

  const statusText = intl.formatMessage(getTaskStatusMessage(status));

  const statusContent = (
    <HStack>
      <Status.Root>
        <Status.Indicator backgroundColor={color} />
      </Status.Root>
      {statusText}
    </HStack>
  );

  if (href && status !== TaskStatus.notStarted) {
    return (
      <Link href={href} variant="underline" display="block">
        {statusContent}
      </Link>
    );
  }

  return statusContent;
};

export default TaskProgress;
