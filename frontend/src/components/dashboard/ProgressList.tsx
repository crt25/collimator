import { Column } from "primereact/column";
import { useCallback, useMemo } from "react";
import DataTable from "@/components/DataTable";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHand, faStar } from "@fortawesome/free-regular-svg-icons";
import { defineMessages, useIntl } from "react-intl";
import styled from "@emotion/styled";
import { useRouter } from "next/router";
import { TableMessages } from "@/i18n/table-messages";
import { useAllSessionSolutions } from "@/api/collimator/hooks/solutions/useAllSessionSolutions";
import { useClassSession } from "@/api/collimator/hooks/sessions/useClassSession";
import { useClass } from "@/api/collimator/hooks/classes/useClass";
import { ExistingSolution } from "@/api/collimator/models/solutions/existing-solution";
import MultiSwrContent from "../MultiSwrContent";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { StudentName } from "../encryption/StudentName";
import { ClassStudent } from "@/api/collimator/models/classes/class-student";

const ProgressListWrapper = styled.div`
  margin: 1rem 0;

  tr {
    cursor: pointer;
  }
`;

const CenterContent = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
`;

const RightAlignContent = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
`;

const TaskState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  * {
    text-align: center;
  }
`;

const TimeOnTask = styled.div``;

const messages = defineMessages({
  nameColumn: {
    id: "ProgressList.columns.name",
    defaultMessage: "Name",
  },
  taskColumn: {
    id: "ProgressList.columns.taskColumn",
    defaultMessage: "Task",
  },
  timeOnTaskColumn: {
    id: "ProgressList.columns.timeOnTask",
    defaultMessage: "Time on Task",
  },
  helpColumn: {
    id: "ProgressList.columns.help",
    defaultMessage: "Help",
  },
  actionsColumn: {
    id: "ProgressList.columns.actions",
    defaultMessage: "Actions",
  },
});

type TaskSolutions = {
  taskId: number;
  solutions: ExistingSolution[];
};

type StudentProgress = {
  student: ClassStudent;
  taskSolutions: TaskSolutions[];
};

const nameTemplate = (progress: StudentProgress) => {
  return <StudentName student={progress.student} />;
};

const taskTemplate = (taskId: number) =>
  function TaskTemplate(rowData: StudentProgress) {
    const intl = useIntl();

    const solutionToDisplay = useMemo(() => {
      const solutions = rowData.taskSolutions.find(
        (s) => s.taskId === taskId,
      )?.solutions;

      return ExistingSolution.findSolutionToDisplay(solutions);
    }, [rowData]);

    return (
      <CenterContent>
        <TaskState>
          <div>
            {solutionToDisplay ? <FontAwesomeIcon icon={faStar} /> : null}
          </div>
          {solutionToDisplay && (
            <time>{intl.formatTime(solutionToDisplay.createdAt)}</time>
          )}
        </TaskState>
      </CenterContent>
    );
  };

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

  const progress = useMemo(() => {
    if (!klass || !session || !solutions) {
      return [];
    }

    return klass.students.map<StudentProgress>((student) => {
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
              (solution) => solution.studentId === student.id,
            ) ?? [],
        };
      });

      return {
        student,
        taskSolutions: taskSolutions,
      };
    });
  }, [klass, session, solutions]);

  const timeOnTaskTemplate = useCallback(
    (_rowData: StudentProgress) => (
      <RightAlignContent>
        <TimeOnTask>00:00</TimeOnTask>
      </RightAlignContent>
    ),
    [],
  );

  const helpTemplate = useCallback(
    (_rowData: StudentProgress) => (
      <CenterContent>
        <FontAwesomeIcon icon={faHand} />
      </CenterContent>
    ),
    [],
  );

  return (
    <ProgressListWrapper>
      <MultiSwrContent
        data={[klass, session, solutions]}
        errors={[klassError, sessionError, solutionsError]}
        isLoading={[isLoadingKlass, isLoadingSession, isLoadingSolutions]}
      >
        {([klass, session]) => (
          <DataTable
            value={progress}
            filterDisplay="row"
            dataKey="id"
            paginator
            rows={10}
            loading={klass.students.length !== progress.length}
            onRowClick={(e) =>
              router.push(
                `/class/${klass.id}/session/${session.id}/progress/student/${(e.data as StudentProgress).student.id}`,
              )
            }
          >
            <Column
              field="name"
              header={intl.formatMessage(messages.nameColumn)}
              sortable
              filter
              filterPlaceholder={intl.formatMessage(
                TableMessages.searchFilterPlaceholder,
              )}
              filterMatchMode="contains"
              showFilterMenu={false}
              body={nameTemplate}
            />
            <Column
              header={intl.formatMessage(messages.helpColumn)}
              alignHeader={"center"}
              body={helpTemplate}
            />
            {session.tasks.map((task, i) => (
              <Column
                key={task.id}
                header={
                  <>
                    {`${intl.formatMessage(messages.taskColumn)} ${i + 1}`}{" "}
                    <FontAwesomeIcon icon={faInfoCircle} />
                  </>
                }
                headerTooltip={task.title}
                headerTooltipOptions={{ position: "bottom" }}
                alignHeader={"center"}
                body={taskTemplate(task.id)}
              />
            ))}
            <Column
              header={intl.formatMessage(messages.timeOnTaskColumn)}
              alignHeader={"right"}
              body={timeOnTaskTemplate}
            />
          </DataTable>
        )}
      </MultiSwrContent>
    </ProgressListWrapper>
  );
};

export default ProgressList;
