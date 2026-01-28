import useSWR from "swr";
import { ApiResponse, getIdOrNaN } from "../helpers";
import { ExistingUser } from "../../models/users/existing-user";
import {
  getUsersControllerFindOneV0Url,
  usersControllerFindOneV0,
} from "../../generated/endpoints/users/users";
import { useAuthenticationOptions } from "../authentication/useAuthenticationOptions";
import { UsersControllerFindOneV0Params } from "../../generated/models";

export type GetUserReturnType = ExistingUser;

const defaultParams: UsersControllerFindOneV0Params = {};

const fetchAndTransform = (
  options: RequestInit,
  id: number,
  params: UsersControllerFindOneV0Params = defaultParams,
): Promise<GetUserReturnType> =>
  usersControllerFindOneV0(id, params, options).then(ExistingUser.fromDto);

export const useUser = (
  id?: number | string,
  params: UsersControllerFindOneV0Params = defaultParams,
): ApiResponse<GetUserReturnType, Error> => {
  const numericId = getIdOrNaN(id);
  const authOptions = useAuthenticationOptions();

  return useSWR(getUsersControllerFindOneV0Url(numericId, params), () =>
    isNaN(numericId)
      ? // return a never-resolving promise to prevent SWR from retrying with the same invalid id
        new Promise<GetUserReturnType>(() => {})
      : fetchAndTransform(authOptions, numericId, params),
  );
};
