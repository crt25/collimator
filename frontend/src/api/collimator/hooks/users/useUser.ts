import useSWR from "swr";
import { ApiResponse, getIdOrNaN } from "../helpers";
import { ExistingUser } from "../../models/users/existing-user";
import {
  getUsersControllerFindOneV0Url,
  usersControllerFindOneV0,
} from "../../generated/endpoints/users/users";

export type GetUserReturnType = ExistingUser;

const fetchAndTransform = (id: number): Promise<GetUserReturnType> =>
  usersControllerFindOneV0(id).then(ExistingUser.fromDto);

export const useUser = (
  id?: number | string,
): ApiResponse<GetUserReturnType, Error> => {
  const numericId = getIdOrNaN(id);

  return useSWR(getUsersControllerFindOneV0Url(numericId), () =>
    isNaN(numericId)
      ? // return a never-resolving promise to prevent SWR from retrying with the same invalid id
        new Promise<GetUserReturnType>(() => {})
      : fetchAndTransform(numericId),
  );
};
