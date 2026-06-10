import { ComponentProps, useMemo } from "react";
import { defineMessages, FormattedMessage, useIntl } from "react-intl";
import styled from "@emotion/styled";
import { Button, HStack, Icon, Status } from "@chakra-ui/react";
import { ColumnDef } from "@tanstack/react-table";
import { useRouter } from "next/router";
import { LuChevronRight } from "react-icons/lu";
import { useClassSession } from "@/api/collimator/hooks/sessions/useClassSession";
import { useClass } from "@/api/collimator/hooks/classes/useClass";
import { ClassStudent } from "@/api/collimator/models/classes/class-student";
import { ExistingStudentSolution } from "@/api/collimator/models/solutions/existing-student-solutions";
import { CurrentStudentAnalysis } from "@/api/collimator/models/solutions/current-student-analysis";
import { ColumnType } from "@/types/tanstack-types";
import { useAllSessionTaskSolutions } from "@/api/collimator/hooks/solutions/useAllSessionTaskSolutions";
import { useCurrentSessionTaskSolutions } from "@/api/collimator/hooks/solutions/useCurrentSessionTaskSolutions";
import { ProgressMessages } from "@/i18n/progress-messages";
import { EmptyState } from "@/components/EmptyState";
import { isClickOnRow } from "@/utilities/table";
import ChakraDataTable, { ColumnSize } from "../ChakraDataTable";
import { StudentName } from "../encryption/StudentName";
import MultiSwrContent from "../MultiSwrContent";
import StarSolutionButton from "../solution/StarSolutionButton";

const TaskInstanceProgressListWrapper = styled.div`
  margin: 1rem 0;
`;

const messages = defineMessages({
  nameColumn: {
    id: "TaskInstanceProgressList.columns.name",
    defaultMessage: "Name",
  },
  progressColumn: {
    id: "TaskInstanceProgressList.columns.progressColumn",
    defaultMessage: "Student Progress",
  },
  lastLoginDateColumn: {
    id: "TaskInstanceProgressList.columns.lastLoginDateColumn",
    defaultMessage: "Last Login Date",
  },
  inShowcaseColumn: {
    id: "TaskInstanceProgressList.columns.inShowcaseColumn",
    defaultMessage: "In Showcase",
  },
  emptyStateTitle: {
    id: "TaskInstanceProgressList.emptyState.title",
    defaultMessage: "There are no students yet.",
  },
  viewDetails: {
    id: "TaskInstanceProgressList.viewDetails",
    defaultMessage: "View student solution",
  },
});

type AnonymousStudent = {
  isAnonymous: true;
  studentId: number;
};

type StudentProgress = {
  id: number;
  student: ClassStudent | AnonymousStudent;
  taskSolutions: ExistingStudentSolution[];
  currentAnalysis: CurrentStudentAnalysis | null;
};

enum TaskStatus {
  notStarted,
  incomplete,
  complete,
}

type StatusColor = ComponentProps<typeof Status.Indicator>["backgroundColor"];

const nameTemplate = (progress: StudentProgress) =>
  "isAnonymous" in progress.student ? (
    <StudentName studentId={progress.student.studentId} />
  ) : (
    <StudentName
      studentId={progress.student.studentId}
      pseudonym={progress.student.pseudonym}
      keyPairId={progress.student.keyPairId}
    />
  );

const InShowCaseTemplate = ({
  classId,
  progress,
}: {
  classId: number;
  progress: StudentProgress;
}) => {
  if (!progress.currentAnalysis) {
    return null;
  }

  return (
    <StarSolutionButton classId={classId} analysis={progress.currentAnalysis} />
  );
};

const TaskTemplate = ({
  classId: _classId,
  rowData,
}: {
  classId: number;
  taskId: number;
  rowData: StudentProgress;
}) => {
  const intl = useIntl();

  const solutionToDisplay = useMemo(
    () => ExistingStudentSolution.findSolutionToDisplay(rowData.taskSolutions),
    [rowData],
  );

  const status = useMemo(() => {
    if (!solutionToDisplay && !rowData.currentAnalysis) {
      // if solution has an analysis then it should be displayed as in progress
      return TaskStatus.notStarted;
    }

    if (!solutionToDisplay) {
      return TaskStatus.incomplete;
    }

    if (solutionToDisplay.tests.every((test) => test.passed)) {
      return TaskStatus.complete;
    }

    return TaskStatus.incomplete;
  }, [solutionToDisplay, rowData.currentAnalysis]);

  const color = useMemo((): StatusColor => {
    if (!solutionToDisplay && !rowData.currentAnalysis) {
      // if solution has an analysis then it should be displayed as in progress
      return "neutral";
    }

    if (!solutionToDisplay) {
      return "error";
    }

    if (solutionToDisplay.tests.every((test) => test.passed)) {
      return "success";
    }

    return "error";
  }, [solutionToDisplay, rowData.currentAnalysis]);

  const statusText = useMemo(() => {
    switch (status) {
      case TaskStatus.complete:
        return intl.formatMessage(ProgressMessages.completeStatus);
      case TaskStatus.incomplete:
        return intl.formatMessage(ProgressMessages.incompleteStatus);
      case TaskStatus.notStarted:
      default:
        return intl.formatMessage(ProgressMessages.notStartedStatus);
    }
  }, [intl, status]);

  return (
    <HStack>
      <Status.Root>
        <Status.Indicator backgroundColor={color} />
      </Status.Root>
      {statusText}
    </HStack>
  );
};

const TaskInstanceProgressList = ({
  classId,
  sessionId,
  taskId,
}: {
  classId: number;
  sessionId: number;
  taskId: number;
}) => {
  const intl = useIntl();
  const router = useRouter();

  const {
    data: klass,
    error: klassError,
    isLoading: isLoadingKlass,
  } = useClass(classId);

  const {
    data: session,
    error: sessionError,
    isLoading: isLoadingSession,
  } = useClassSession(classId, sessionId);

  const {
    data: solutions,
    error: solutionsError,
    isLoading: isLoadingSolutions,
  } = useAllSessionTaskSolutions(classId, sessionId, taskId);

  const { data: currentAnalyses } = useCurrentSessionTaskSolutions(
    classId,
    sessionId,
    taskId,
  );

  const studentIds = useMemo(() => {
    if (!klass || !solutions) {
      return [];
    }

    const studentIdsSet = new Set([
      ...klass.students.map((student) => student.studentId),
      ...solutions.map((s) => s.studentId),
      ...(currentAnalyses ?? [])
        .filter(
          (a): a is CurrentStudentAnalysis =>
            a instanceof CurrentStudentAnalysis,
        )
        .map((a) => a.studentId),
    ]);
    return [...studentIdsSet];
  }, [klass, solutions, currentAnalyses]);

  const progress = useMemo(() => {
    if (!klass || !session || !solutions) {
      return [];
    }

    const students = studentIds.map((studentId) => {
      const student = klass.students.find((s) => s.studentId === studentId);

      return (
        student ??
        ({
          isAnonymous: true,
          studentId,
        } satisfies AnonymousStudent)
      );
    });

    return students.map<StudentProgress>((student) => {
      const taskSolutions = solutions.filter(
        (solution) => solution.studentId === student.studentId,
      );

      // A student is either already in the showcase (teacher needs to unstar)
      // or not yet (teacher needs to star). findAnalysisToDisplay returns the
      // latest non-starred analysis so the button is starrable.
      // It falls back to the starred analysis when that's all the student has.
      const currentAnalysis = CurrentStudentAnalysis.findAnalysisToDisplay(
        currentAnalyses ?? [],
        student.studentId,
      );

      return {
        id: student.studentId,
        student,
        taskSolutions,
        currentAnalysis,
      } satisfies StudentProgress;
    });
  }, [klass, session, solutions, currentAnalyses, studentIds]);

  const columns: ColumnDef<StudentProgress>[] = useMemo(() => {
    return [
      {
        id: "name",
        header: intl.formatMessage(messages.nameColumn),
        cell: (info) => nameTemplate(info.row.original),
        meta: {
          columnType: ColumnType.text,
        },
      },
      /*
        This data is already stored with the student activities but no endpoint to fetch it exist at the moment.
      {
        id: "lastLoginDate",
        header: intl.formatMessage(messages.lastLoginDateColumn),
        cell: (info) => nameTemplate(info.row.original),
        meta: {
          columnType: ColumnType.text,
        },
      },*/
      {
        id: "progress",
        header: intl.formatMessage(messages.progressColumn),
        cell: (info) => (
          <TaskTemplate
            classId={classId}
            taskId={taskId}
            rowData={info.row.original}
          />
        ),
        meta: {
          columnType: ColumnType.icon,
        },
      },
      {
        id: "inShowcase",
        header: intl.formatMessage(messages.inShowcaseColumn),
        cell: (info) => (
          <InShowCaseTemplate classId={classId} progress={info.row.original} />
        ),
        meta: {
          columnType: ColumnType.text,
        },
      },
      {
        id: "details",
        header: "",
        cell: (info) => (
          <Button
            aria-label={intl.formatMessage(messages.viewDetails)}
            onClick={(e) => {
              e.stopPropagation();
              router.push(
                `/class/${classId}/session/${sessionId}/task/${taskId}/student/${info.row.original.id}`,
              );
            }}
            data-testid={`class-${info.row.original.id}-details-button`}
            variant="detail"
          >
            <Icon>
              <LuChevronRight />
            </Icon>
          </Button>
        ),
        size: ColumnSize.sm,
        meta: {
          columnType: ColumnType.icon,
        },
      },
    ];
  }, [intl, classId, sessionId, taskId, router]);

  return (
    <TaskInstanceProgressListWrapper data-testid="task-instance-progress-list">
      <MultiSwrContent
        data={[klass, session, solutions]}
        errors={[klassError, sessionError, solutionsError]}
        isLoading={[isLoadingKlass, isLoadingSession, isLoadingSolutions]}
      >
        {([klass, session]) => (
          <ChakraDataTable
            emptyStateElement={
              <EmptyState
                title={<FormattedMessage {...messages.emptyStateTitle} />}
              />
            }
            data={progress}
            columns={columns}
            onRowClick={(row, e) => {
              if (isClickOnRow(e)) {
                router.push(
                  `/class/${klass.id}/session/${session.id}/task/${taskId}/student/${row.id}`,
                );
              }
            }}
          />
        )}
      </MultiSwrContent>
    </TaskInstanceProgressListWrapper>
  );
};

export default TaskInstanceProgressList;
