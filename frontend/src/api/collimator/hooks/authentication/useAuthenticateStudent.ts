import { useCallback } from "react";
import { authenticationControllerLoginStudentV0 } from "../../generated/endpoints/authentication/authentication";
import {
  StudentAuthenticationRequestDto,
  StudentAuthenticationResponseDto,
} from "../../generated/models";
import { useAuthenticationOptions } from "./useAuthenticationOptions";

type AuthenticateStudentType = (
  studentAuthenticationRequestDto: StudentAuthenticationRequestDto,
) => Promise<StudentAuthenticationResponseDto>;

const fetchAndTransform = (
  options: RequestInit,
  studentAuthenticationRequestDto: StudentAuthenticationRequestDto,
): ReturnType<AuthenticateStudentType> =>
  authenticationControllerLoginStudentV0(
    studentAuthenticationRequestDto,
    options,
  );

export const useAuthenticateStudent = (): AuthenticateStudentType => {
  const authOptions = useAuthenticationOptions();

  return useCallback(
    (studentAuthenticationRequestDto) =>
      fetchAndTransform(authOptions, studentAuthenticationRequestDto),
    [authOptions],
  );
};
