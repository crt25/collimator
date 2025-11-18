import { ComponentProps, useMemo } from "react";
import { defineMessages, useIntl } from "react-intl";
import styled from "@emotion/styled";
import { HStack, Status } from "@chakra-ui/react";
import { ColumnDef } from "@tanstack/react-table";
import { useClassSession } from "@/api/collimator/hooks/sessions/useClassSession";
import { useClass } from "@/api/collimator/hooks/classes/useClass";
import { ClassStudent } from "@/api/collimator/models/classes/class-student";
import { ExistingStudentSolution } from "@/api/collimator/models/solutions/existing-student-solutions";
import { ColumnType } from "@/types/tanstack-types";
import { useAllSessionTaskSolutions } from "@/api/collimator/hooks/solutions/useAllSessionTaskSolutions";
import { ProgressMessages } from "@/i18n/progress-messages";
import ChakraDataTable from "../ChakraDataTable";
import { StudentName } from "../encryption/StudentName";
import MultiSwrContent from "../MultiSwrContent";

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
});

type AnonymousStudent = {
  isAnonymous: true;
  studentId: number;
};

type StudentProgress = {
  id: number;
  student: ClassStudent | AnonymousStudent;
  taskSolutions: ExistingStudentSolution[];
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

  const studentIds = useMemo(() => {
    if (!klass || !solutions) {
      return [];
    }

    const studentIdsSet = new Set([
      ...klass.students.map((student) => student.studentId),
      ...solutions.map((s) => s.studentId),
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
      const taskSolutions = solutions.filter(
        (solution) => solution.studentId === student.studentId,
      );

      return {
        id: student.studentId,
        student,
        taskSolutions: taskSolutions,
      } satisfies StudentProgress;
    });
  }, [klass, session, solutions, studentIds]);

  const columns: ColumnDef<StudentProgress>[] = useMemo(() => {
    return [
      {
        id: "name",
        header: intl.formatMessage(messages.nameColumn),
        enableSorting: false,
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
        enableSorting: false,
        cell: (info) => nameTemplate(info.row.original),
        meta: {
          columnType: ColumnType.text,
        },
      },*/
      {
        id: "progress",
        header: intl.formatMessage(messages.progressColumn),
        enableSorting: false,
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
      /*
        For this to properly work, we should probably move the 'isReference' boolean
        from the analysis to the solution model.
        
      {
        id: "inShowcase",
        header: intl.formatMessage(messages.inShowcaseColumn),
        enableSorting: false,
        cell: (info) => nameTemplate(info.row.original),
        meta: {
          columnType: ColumnType.text,
        },
      },*/
    ];
  }, [intl, classId, taskId]);

  return (
    <TaskInstanceProgressListWrapper data-testid="progress-list">
      <MultiSwrContent
        data={[klass, session, solutions]}
        errors={[klassError, sessionError, solutionsError]}
        isLoading={[isLoadingKlass, isLoadingSession, isLoadingSolutions]}
      >
        {([_klass, _session]) => (
          <ChakraDataTable
            data={progress}
            columns={columns}
            features={{
              sorting: true,
              pagination: {
                pageSize: 10,
              },
            }}
          />
        )}
      </MultiSwrContent>
    </TaskInstanceProgressListWrapper>
  );
};

export default TaskInstanceProgressList;
