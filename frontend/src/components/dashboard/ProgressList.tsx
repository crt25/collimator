import { useMemo } from "react";
import { defineMessages, useIntl, FormattedMessage } from "react-intl";
import styled from "@emotion/styled";
import { Link, Text } from "@chakra-ui/react";
import { ColumnDef } from "@tanstack/react-table";
import { useAllSessionSolutions } from "@/api/collimator/hooks/solutions/useAllSessionSolutions";
import { ExistingStudentSolution } from "@/api/collimator/models/solutions/existing-student-solutions";
import { CurrentStudentAnalysis } from "@/api/collimator/models/solutions/current-student-analysis";
import { ColumnType } from "@/types/tanstack-types";
import { useAllSessionCurrentAnalyses } from "@/api/collimator/hooks/solutions/useAllSessionCurrentAnalyses";
import {
  ResolvedStudent,
  useSessionStudents,
} from "@/hooks/useStudentProgress";
import TaskProgress from "../task-progress";
import MultiSwrContent from "../MultiSwrContent";
import { ResolvedStudentName } from "../encryption/StudentName";
import ChakraDataTable from "../ChakraDataTable";
import { EmptyState } from "../EmptyState";

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
  emptyStateTitle: {
    id: "ProgressList.emptyState.title",
    defaultMessage: "There is no progress data available.",
  },
});

type TaskSolutions = {
  taskId: number;
  solutions: ExistingStudentSolution[];
  currentAnalysis: CurrentStudentAnalysis | null;
};

type StudentProgress = {
  id: number;
  student: ResolvedStudent;
  taskSolutions: TaskSolutions[];
};

const nameTemplate = (progress: StudentProgress) => (
  <Text fontWeight="semibold" fontSize="lg" margin={0}>
    <ResolvedStudentName student={progress.student} />
  </Text>
);

const TaskTemplate = ({
  classId,
  sessionId,
  taskId,
  rowData,
}: {
  classId: number;
  sessionId: number;
  taskId: number;
  rowData: StudentProgress;
}) => {
  const taskSolutions = useMemo(
    () => rowData.taskSolutions.find((s) => s.taskId === taskId),
    [taskId, rowData],
  );

  return (
    <TaskProgress
      solutions={taskSolutions?.solutions}
      currentAnalysis={taskSolutions?.currentAnalysis ?? null}
      href={`/class/${classId}/session/${sessionId}/task/${taskId}/student/${rowData.id}`}
    />
  );
};

/* [CRT-434] Not functional yet, as we don't have a way to know if a student needs help or not
const helpTemplate = (_rowData: StudentProgress) => (
  <Icon>
    <LuHand />
  </Icon>
);
*/

const ProgressList = ({
  classId,
  sessionId,
}: {
  classId: number;
  sessionId: number;
}) => {
  const intl = useIntl();

  const {
    data: solutions,
    error: solutionsError,
    isLoading: isLoadingSolutions,
  } = useAllSessionSolutions(classId, sessionId);

  const { data: currentAnalyses } = useAllSessionCurrentAnalyses(
    classId,
    sessionId,
  );

  const activeStudentIds = useMemo(
    () => [
      ...(solutions?.flatMap((s) => s.solutions.map((sol) => sol.studentId)) ??
        []),
      ...(currentAnalyses ?? []).flatMap((s) =>
        s.analyses
          .filter(
            (a): a is CurrentStudentAnalysis =>
              a instanceof CurrentStudentAnalysis,
          )
          .map((a) => a.studentId),
      ),
    ],
    [solutions, currentAnalyses],
  );

  const { klass, session, students, errors, isLoading } = useSessionStudents(
    classId,
    sessionId,
    activeStudentIds,
  );

  const progress = useMemo(() => {
    if (!klass || !session || !solutions) {
      return [];
    }

    return students.map<StudentProgress>((student) => {
      // group solutions of this student by task
      const taskSolutions = session.tasks.map((task) => {
        // find all solutions for this task and student
        const studentSolutions = solutions.find(
          (s) => s.taskId === task.id,
        )?.solutions;

        const taskAnalyses = currentAnalyses?.find(
          (a) => a.taskId === task.id,
        )?.analyses;

        return {
          taskId: task.id,
          solutions:
            studentSolutions?.filter(
              (solution) => solution.studentId === student.studentId,
            ) ?? [],
          currentAnalysis: CurrentStudentAnalysis.findAnalysisToDisplay(
            taskAnalyses ?? [],
            student.studentId,
          ),
        };
      });

      return {
        id: student.studentId,
        student,
        taskSolutions: taskSolutions,
      } satisfies StudentProgress;
    });
  }, [klass, session, solutions, currentAnalyses, students]);

  const columns: ColumnDef<StudentProgress>[] = useMemo(() => {
    const firstColumns: ColumnDef<StudentProgress>[] = [
      {
        id: "name",
        header: intl.formatMessage(messages.nameColumn),
        cell: (info) => nameTemplate(info.row.original),
        meta: {
          columnType: ColumnType.text,
        },
      },
      /*
      [CRT-434] Not functional yet, as we don't have a way to know if a student needs help or not
      {
        id: "helpNeeded",
        header: intl.formatMessage(messages.helpColumn),
        cell: (info) => helpTemplate(info.row.original),
        size: ColumnSize.sm,
        meta: {
          columnType: ColumnType.text,
        },
      },
      */
    ];

    const lastColumns: ColumnDef<StudentProgress>[] = [];

    const taskColumns: ColumnDef<StudentProgress>[] = (
      session?.tasks ?? []
    ).map(
      (task, i) =>
        ({
          id: "task-" + task.id,
          header: () => (
            <Link
              href={`/class/${classId}/session/${session?.id}/task/${task.id}/student`}
              variant="underline"
              data-testid={`task-${task.id}`}
            >{`${intl.formatMessage(messages.taskColumn)} ${i + 1}`}</Link>
          ),
          cell: (info) => (
            <TaskTemplate
              classId={classId}
              sessionId={sessionId}
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
  }, [intl, session, classId, sessionId]);

  return (
    <ProgressListWrapper data-testid="progress-list">
      <MultiSwrContent
        data={[klass, session, solutions]}
        errors={[...errors, solutionsError]}
        isLoading={[...isLoading, isLoadingSolutions]}
      >
        {([_klass, _session]) => (
          <ChakraDataTable
            data={progress}
            columns={columns}
            emptyStateElement={
              <EmptyState
                title={<FormattedMessage {...messages.emptyStateTitle} />}
              />
            }
          />
        )}
      </MultiSwrContent>
    </ProgressListWrapper>
  );
};

export default ProgressList;
