import useSWR from "swr";
import { ApiResponse } from "../helpers";
import {
  authenticationControllerFindPublicKeyV0,
  getAuthenticationControllerFindPublicKeyV0Url,
} from "../../generated/endpoints/authentication/authentication";

type PublicKeyType = {
  publicKey: JsonWebKey;
  teacherId: number;
};

export const fetchPublicKey = (fingerprint: string): Promise<PublicKeyType> =>
  authenticationControllerFindPublicKeyV0(fingerprint).then((key) => ({
    publicKey: JSON.parse(key.publicKey) as JsonWebKey,
    teacherId: key.teacherId,
  }));

export const usePublicKey = (
  fingerprint?: string,
): ApiResponse<PublicKeyType, Error> =>
  useSWR(
    fingerprint
      ? getAuthenticationControllerFindPublicKeyV0Url(fingerprint)
      : null,
    () =>
      fingerprint === undefined
        ? // return a never-resolving promise to prevent SWR from retrying with the same invalid id
          new Promise<PublicKeyType>(() => {})
        : fetchPublicKey(fingerprint),
  );
