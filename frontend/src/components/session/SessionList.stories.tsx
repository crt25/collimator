import SessionList from "./SessionList";
import { backendHostName } from "@/utilities/constants";
import { getSessionsControllerFindAllV0ResponseMock } from "@/api/collimator/generated/endpoints/sessions/sessions.msw";
import {
  getSessionsControllerFindAllV0Url,
  getSessionsControllerRemoveV0Url,
} from "@/api/collimator/generated/endpoints/sessions/sessions";

const classId = 1;
const sessions = getSessionsControllerFindAllV0ResponseMock();

export default {
  component: SessionList,
  title: "SessionList",
  parameters: {
    mockData: [
      {
        url: `${backendHostName}${getSessionsControllerFindAllV0Url(classId)}`,
        method: "GET",
        status: 200,
        response: sessions,
      },
      ...sessions.map((session) => ({
        url: `${backendHostName}${getSessionsControllerRemoveV0Url(classId, session.id)}`,
        method: "DELETE",
        status: 200,
        response: () => {
          sessions.splice(sessions.indexOf(session), 1);
          return session;
        },
      })),
    ],
  },
};

export const Default = {};
