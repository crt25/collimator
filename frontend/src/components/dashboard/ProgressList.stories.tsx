import { backendHostName } from "@/utilities/constants";
import { getClassesControllerFindOneV0ResponseMock } from "@/api/collimator/generated/endpoints/classes/classes.msw";
import { getClassesControllerFindOneV0Url } from "@/api/collimator/generated/endpoints/classes/classes";
import { getSessionsControllerFindOneV0Url } from "@/api/collimator/generated/endpoints/sessions/sessions";
import { getSessionsControllerFindOneV0ResponseMock } from "@/api/collimator/generated/endpoints/sessions/sessions.msw";
import { getSolutionsControllerFindAllStudentSolutionsV0ResponseMock } from "@/api/collimator/generated/endpoints/solutions/solutions.msw";
import { getSolutionsControllerFindAllStudentSolutionsV0Url } from "@/api/collimator/generated/endpoints/solutions/solutions";
import {
  ClassStudentDto,
  ExistingStudentSolutionDto,
} from "@/api/collimator/generated/models";
import ProgressList from "./ProgressList";

const classId = 1;
const sessionId = 1;

const student: ClassStudentDto = {
  studentId: 937281,
  pseudonym: "Donald Duck",
  keyPairId: 1,
};
const klass = getClassesControllerFindOneV0ResponseMock({ id: classId });
klass.students.push(student);

const session = getSessionsControllerFindOneV0ResponseMock({ id: sessionId });

export default {
  component: ProgressList,
  title: "ProgressList",
  parameters: {
    mockData: [
      {
        url: `${backendHostName}${getClassesControllerFindOneV0Url(classId)}`,
        method: "GET",
        status: 200,
        response: klass,
      },
      {
        url: `${backendHostName}${getSessionsControllerFindOneV0Url(classId, sessionId)}`,
        method: "GET",
        status: 200,
        response: session,
      },
      ...session.tasks.map((task) => ({
        url: `${backendHostName}${getSolutionsControllerFindAllStudentSolutionsV0Url(classId, sessionId, task.id)}`,
        method: "GET",
        status: 200,
        response:
          getSolutionsControllerFindAllStudentSolutionsV0ResponseMock().map(
            (solution, solutionIndex) =>
              ({
                ...solution,
                studentId:
                  klass.students.find(
                    (_, studentIndex) => solutionIndex % 4 === studentIndex % 4,
                  )?.studentId ?? student,
              }) as ExistingStudentSolutionDto,
          ),
      })),
    ],
  },
};

type Args = Parameters<typeof ProgressList>[0];

export const Default = {
  args: {
    classId,
    sessionId,
  } as Args,
};
