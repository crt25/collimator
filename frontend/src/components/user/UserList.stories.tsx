import UserList from "./UserList";
import { getUsersControllerFindAllResponseMock } from "@/api/collimator/generated/endpoints/users/users.msw";
import { backendHostName } from "@/utilities/constants";
import {
  getUsersControllerDeleteUrl,
  getUsersControllerFindAllUrl,
} from "@/api/collimator/generated/endpoints/users/users";

const users = getUsersControllerFindAllResponseMock();

export default {
  component: UserList,
  title: "UserList",
  parameters: {
    mockData: [
      {
        url: `${backendHostName}${getUsersControllerFindAllUrl()}`,
        method: "GET",
        status: 200,
        response: users,
      },

      ...users.map((user) => ({
        url: `${backendHostName}${getUsersControllerDeleteUrl(user.id)}`,
        method: "DELETE",
        status: 200,
        response: () => {
          users.splice(users.indexOf(user), 1);
          return user;
        },
      })),
    ],
  },
};

export const Default = {};
