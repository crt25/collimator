import { ComponentProps, useMemo } from "react";
import { defineMessages, useIntl } from "react-intl";
import styled from "@emotion/styled";
import { useRouter } from "next/router";
import { HStack, Icon, Status } from "@chakra-ui/react";
import { LuChevronRight, LuHand } from "react-icons/lu";
import { ColumnDef } from "@tanstack/react-table";
import { useAllSessionSolutions } from "@/api/collimator/hooks/solutions/useAllSessionSolutions";
import { useClassSession } from "@/api/collimator/hooks/sessions/useClassSession";
import { useClass } from "@/api/collimator/hooks/classes/useClass";
import { ClassStudent } from "@/api/collimator/models/classes/class-student";
import { ExistingStudentSolution } from "@/api/collimator/models/solutions/existing-student-solutions";
import { ColumnType } from "@/types/tanstack-types";
import { isClickOnRow } from "@/utilities/table";
import MultiSwrContent from "../MultiSwrContent";
import { StudentName } from "../encryption/StudentName";
import ChakraDataTable from "../ChakraDataTable";
import Button from "../Button";

const ProgressListWrapper = styled.div`
  margin: 1rem 0;
`;

const messages = defineMessages({
  nameColumn: {
    id: "ProgressList.columns.name",
    defaultMessage: "Name",
  },
  taskColumn: {
    id: "ProgressList.columns.taskColumn",
    defaultMessage: "Task",
  },
  helpColumn: {
    id: "ProgressList.columns.help",
    defaultMessage: "Help",
  },
  actionsColumn: {
    id: "ProgressList.columns.actions",
    defaultMessage: "Actions",
  },
  notStartedStatus: {
    id: "ProgressList.notStartedStatus",
    defaultMessage: "Not Started",
  },
  incompleteStatus: {
    id: "ProgressList.incompleteStatus",
    defaultMessage: "Incomplete",
  },
  completeStatus: {
    id: "ProgressList.completedStatus",
    defaultMessage: "Complete",
  },
});

type TaskSolutions = {
  taskId: number;
  solutions: ExistingStudentSolution[];
};

type AnonymousStudent = {
  isAnonymous: true;
  studentId: number;
};

type StudentProgress = {
  id: number;
  student: ClassStudent | AnonymousStudent;
  taskSolutions: TaskSolutions[];
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

const TaskTemplate = ({
  classId: _classId,
  taskId,
  rowData,
}: {
  classId: number;
  taskId: number;
  rowData: StudentProgress;
}) => {
  const intl = useIntl();

  const solutionToDisplay = useMemo(() => {
    const solutions = rowData.taskSolutions.find(
      (s) => s.taskId === taskId,
    )?.solutions;

    return ExistingStudentSolution.findSolutionToDisplay(solutions);
  }, [taskId, rowData]);

  const status = useMemo(() => {
    if (!solutionToDisplay) {
      return TaskStatus.notStarted;
    }

    if (solutionToDisplay.tests.every((test) => test.passed)) {
      return TaskStatus.complete;
    }

    return TaskStatus.incomplete;
  }, [solutionToDisplay]);

  const color = useMemo((): StatusColor => {
    if (!solutionToDisplay) {
      return "neutral";
    }

    if (solutionToDisplay.tests.every((test) => test.passed)) {
      return "success";
    }

    return "error";
  }, [solutionToDisplay]);

  const statusText = useMemo(() => {
    switch (status) {
      case TaskStatus.complete:
        return intl.formatMessage(messages.completeStatus);
      case TaskStatus.incomplete:
        return intl.formatMessage(messages.incompleteStatus);
      case TaskStatus.notStarted:
      default:
        return intl.formatMessage(messages.notStartedStatus);
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

const helpTemplate = (_rowData: StudentProgress) => (
  <Icon>
    <LuHand />
  </Icon>
);

const ProgressList = ({
  classId,
  sessionId,
}: {
  classId: number;
  sessionId: number;
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
  } = useAllSessionSolutions(classId, sessionId);

  const studentIds = useMemo(() => {
    if (!klass || !solutions) {
      return [];
    }

    const studentIdsSet = new Set([
      ...klass.students.map((student) => student.studentId),
      ...solutions.flatMap((s) => s.solutions.map((s) => s.studentId)),
    ]);
    return [...studentIdsSet];
  }, [klass, solutions]);

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
      // group solutions of this student by task
      const taskSolutions = session.tasks.map((task) => {
        // find all solutions for this task and student
        const studentSolutions = solutions.find(
          (s) => s.taskId === task.id,
        )?.solutions;

        return {
          taskId: task.id,
          solutions:
            studentSolutions?.filter(
              (solution) => solution.studentId === student.studentId,
            ) ?? [],
        };
      });

      return {
        id: student.studentId,
        student,
        taskSolutions: taskSolutions,
      } satisfies StudentProgress;
    });
  }, [klass, session, solutions, studentIds]);

  const columns: ColumnDef<StudentProgress>[] = useMemo(() => {
    const firstColumns: ColumnDef<StudentProgress>[] = [
      {
        id: "name",
        header: intl.formatMessage(messages.nameColumn),
        enableSorting: false,
        cell: (info) => nameTemplate(info.row.original),
        meta: {
          columnType: ColumnType.text,
        },
      },
      {
        id: "helpNeeded",
        header: intl.formatMessage(messages.helpColumn),
        enableSorting: false,
        cell: (info) => helpTemplate(info.row.original),
        size: 32,
        meta: {
          columnType: ColumnType.text,
        },
      },
    ];

    const lastColumns: ColumnDef<StudentProgress>[] = [
      {
        id: "details",
        header: "",
        enableSorting: false,
        cell: (info) => (
          <Button
            aria-label={intl.formatMessage(messages.actionsColumn)}
            onClick={(e) => {
              e.stopPropagation();
              router.push(
                `/class/${classId}/session/${info.row.original.id}/progress/student/${info.row.original.student.studentId}`,
              );
            }}
            variant="detail"
          >
            <Icon>
              <LuChevronRight />
            </Icon>
          </Button>
        ),
        meta: {
          columnType: ColumnType.icon,
        },
      },
    ];

    const taskColumns: ColumnDef<StudentProgress>[] = (
      session?.tasks ?? []
    ).map(
      (task, i) =>
        ({
          id: "task-" + task.id,
          header: `${intl.formatMessage(messages.taskColumn)} ${i + 1}`,
          enableSorting: false,
          cell: (info) => (
            <TaskTemplate
              classId={classId}
              taskId={task.id}
              rowData={info.row.original}
            />
          ),
          meta: {
            columnType: ColumnType.icon,
          },
        }) satisfies ColumnDef<StudentProgress>,
    );

    return [...firstColumns, ...taskColumns, ...lastColumns];
  }, [intl, session, router, classId]);

  return (
    <ProgressListWrapper data-testid="progress-list">
      <MultiSwrContent
        data={[klass, session, solutions]}
        errors={[klassError, sessionError, solutionsError]}
        isLoading={[isLoadingKlass, isLoadingSession, isLoadingSolutions]}
      >
        {([klass, session]) => (
          <ChakraDataTable
            data={progress}
            columns={columns}
            onRowClick={(row, e) => {
              if (isClickOnRow(e)) {
                router.push(
                  `/class/${klass.id}/session/${session.id}/progress/student/${row.student.studentId}`,
                );
              }
            }}
            features={{
              sorting: true,
              pagination: {
                pageSize: 10,
              },
            }}
          />
        )}
      </MultiSwrContent>
    </ProgressListWrapper>
  );
};

export default ProgressList;
