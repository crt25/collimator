import useSWR from "swr";
import { ApiResponse } from "../helpers";
import { ExistingUser } from "../../models/users/existing-user";
import {
  getUsersControllerFindOneUrl,
  usersControllerFindOne,
} from "../../generated/endpoints/users/users";

export type GetUserReturnType = ExistingUser;

const fetchAndTransform = (id: number): Promise<GetUserReturnType> =>
  usersControllerFindOne(id).then(ExistingUser.fromDto);

export const useUser = (
  id: number | string,
): ApiResponse<GetUserReturnType, Error> => {
  const numericId = typeof id === "string" ? parseInt(id, 10) : id;

  return useSWR(getUsersControllerFindOneUrl(numericId), () =>
    isNaN(numericId) ? Promise.reject() : fetchAndTransform(numericId),
  );
};
