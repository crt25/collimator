import { useCallback } from "react";
import { authenticationControllerLoginAnonymousStudentV0 } from "../../generated/endpoints/authentication/authentication";
import {
  AnonymousStudentAuthenticationRequestDto,
  StudentAuthenticationResponseDto,
} from "../../generated/models";

type AuthenticateAnonymousStudentType = (
  studentAuthenticationRequestDto: AnonymousStudentAuthenticationRequestDto,
) => Promise<StudentAuthenticationResponseDto>;

const fetchAndTransform = (
  studentAuthenticationRequestDto: AnonymousStudentAuthenticationRequestDto,
): ReturnType<AuthenticateAnonymousStudentType> =>
  authenticationControllerLoginAnonymousStudentV0(
    studentAuthenticationRequestDto,
  );

export const useAuthenticateAnonymousStudent =
  (): AuthenticateAnonymousStudentType =>
    useCallback(
      (studentAuthenticationRequestDto) =>
        fetchAndTransform(studentAuthenticationRequestDto),
      [],
    );
