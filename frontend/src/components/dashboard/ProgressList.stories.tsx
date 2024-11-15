import { backendHostName } from "@/utilities/constants";
import ProgressList from "./ProgressList";
import { getClassesControllerFindOneV0ResponseMock } from "@/api/collimator/generated/endpoints/classes/classes.msw";
import { getClassesControllerFindOneV0Url } from "@/api/collimator/generated/endpoints/classes/classes";
import { getSessionsControllerFindOneV0Url } from "@/api/collimator/generated/endpoints/sessions/sessions";
import { getSessionsControllerFindOneV0ResponseMock } from "@/api/collimator/generated/endpoints/sessions/sessions.msw";
import { getSolutionsControllerFindAllV0ResponseMock } from "@/api/collimator/generated/endpoints/solutions/solutions.msw";
import { getSolutionsControllerFindAllV0Url } from "@/api/collimator/generated/endpoints/solutions/solutions";
import {
  ClassStudentDto,
  ExistingSolutionDto,
} from "@/api/collimator/generated/models";

const classId = 1;
const sessionId = 1;

const student: ClassStudentDto = {
  id: 937281,
  pseudonym: "Donald Duck",
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
        url: `${backendHostName}${getSolutionsControllerFindAllV0Url(classId, sessionId, task.id)}`,
        method: "GET",
        status: 200,
        response: getSolutionsControllerFindAllV0ResponseMock().map(
          (solution, solutionIndex) =>
            ({
              ...solution,
              studentId:
                klass.students.find(
                  (_, studentIndex) => solutionIndex % 4 === studentIndex % 4,
                )?.id ?? student,
            }) as ExistingSolutionDto,
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
