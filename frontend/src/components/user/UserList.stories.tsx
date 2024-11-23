import UserList from "./UserList";
import { getUsersControllerFindAllV0ResponseMock } from "@/api/collimator/generated/endpoints/users/users.msw";
import { backendHostName } from "@/utilities/constants";
import {
  getUsersControllerDeleteV0Url,
  getUsersControllerFindAllV0Url,
} from "@/api/collimator/generated/endpoints/users/users";

const users = getUsersControllerFindAllV0ResponseMock();

export default {
  component: UserList,
  title: "UserList",
  parameters: {
    mockData: [
      {
        url: `${backendHostName}${getUsersControllerFindAllV0Url()}`,
        method: "GET",
        status: 200,
        response: users,
      },

      ...users.map((user) => ({
        url: `${backendHostName}${getUsersControllerDeleteV0Url(user.id)}`,
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
