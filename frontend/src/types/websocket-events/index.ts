import { Socket } from "socket.io-client";

type AuthenticationToken = string;

export type StudentAuthenticationRequestContent =
  | {
      isAnonymous: false;
      classId: number;
      idToken: string;
    }
  | {
      isAnonymous: true;
      classId: number;
      pseudonym: string;
    };

export type StudentAuthenticationRequest = {
  // The public key of the student as a JWK
  studentPublicKey: string;
  // The encrypted authentication request encoded in base64.
  encryptedAuthenticationRequest: string;
};

export type StudentAuthenticationResponse = {
  // the encrypted authentication token, encoded in base64
  authenticationToken: AuthenticationToken;
};

export interface ServerToClientEvents {
  /**
   * The message forwarded by the server to a teacher client when a student wants to sign in.
   */
  requestTeacherToSignInStudent: (
    data: StudentAuthenticationRequest & {
      // a unique identifier for the server-side session. must be passed back to the server.
      socketId: string;
    },
  ) => void;

  /**
   * The message forwarded by the server to a student when the teacher
   * has authenticated the student.
   */
  studentAuthenticationToken: (data: StudentAuthenticationResponse) => void;
}

export interface ClientToServerEvents {
  /**
   * The message sent by a student that wants to sign in to a class.
   * @returns An authentication token for the student.
   */
  requestTeacherToSignInStudent: (
    data: StudentAuthenticationRequest & {
      // the user id of the teacher who will be asked to sign in the student
      teacherId: number;
    },
  ) => void;

  /**
   * The event sent by a teacher that authenticates a student.
   */
  studentAuthenticationToken: (
    data: StudentAuthenticationResponse & {
      // the unique identifier for the server-side session
      socketId: string;
    },
  ) => void;
}

export type CollimatorSocket = Socket<
  ServerToClientEvents,
  ClientToServerEvents
>;
