import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { io } from "socket.io-client";
import {
  AdminOrTeacherAuthenticated,
  AuthenticationContext,
  isFullyAuthenticated,
  isStudentLocallyAuthenticated,
  StudentAuthenticated,
  StudentLocallyAuthenticated,
} from "./AuthenticationContext";
import {
  backendHostName,
  openIdConnectMicrosoftClientId,
} from "@/utilities/constants";
import {
  CollimatorSocket,
  StudentAuthenticationRequestContent,
} from "@/types/websocket-events";
import { UserRole } from "@/types/user/user-role";
import { useFetchClass } from "@/api/collimator/hooks/classes/useFetchClass";
import { decodeBase64, encodeBase64 } from "@/utilities/crypto/base64";
import { verifyJwtToken } from "@/utilities/authentication/jwt";
import { StudentIdentity } from "@/api/collimator/models/classes/class-student";
import { useAuthenticateStudent } from "@/api/collimator/hooks/authentication/useAuthenticateStudent";

export type WebSocketContextType = {
  socket: CollimatorSocket;
};

export const WebSocketContext = createContext<WebSocketContextType | null>(
  null,
);

const WebSocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [webSocketState, setWebSocketState] =
    useState<WebSocketContextType | null>(null);

  const authContext = useContext(AuthenticationContext);
  const fetchClass = useFetchClass();
  const authenticateStudent = useAuthenticateStudent();

  const setupListeners = useCallback(
    (
      authContext:
        | AdminOrTeacherAuthenticated
        | StudentAuthenticated
        | StudentLocallyAuthenticated,
      socket: CollimatorSocket,
    ) => {
      if (authContext.role !== UserRole.student) {
        socket.on(
          "requestTeacherToSignInStudent",
          async ({
            studentPublicKey,
            encryptedAuthenticationRequest,
            socketId,
          }) => {
            const ephemeralKey =
              await authContext.keyPair.deriveSharedEphemeralKey(
                JSON.parse(studentPublicKey),
              );

            const authenticationRequest = JSON.parse(
              await ephemeralKey.decryptString(
                decodeBase64(encryptedAuthenticationRequest),
              ),
            ) as StudentAuthenticationRequestContent;

            // verify the received id token and fetch the class
            const [verifiedToken, klass] = await Promise.all([
              verifyJwtToken(
                authenticationRequest.idToken,
                openIdConnectMicrosoftClientId,
              ),
              fetchClass(authenticationRequest.classId),
            ]);

            if (klass.teacher.id !== authContext.userId) {
              throw new Error(
                "We can only authenticate students in classes that we are the teacher of",
              );
            }

            const longTermIdentifier = verifiedToken.payload["sub"];
            const name = verifiedToken.payload["name"];

            // try to decrypt all students in the class
            const matchingPseudonyms = await Promise.all(
              klass.students.map(async (student) => {
                try {
                  const decryptedIdentity = JSON.parse(
                    await authContext.keyPair.decryptString(
                      decodeBase64(student.pseudonym),
                    ),
                  ) as StudentIdentity;

                  return decryptedIdentity.longTermIdentifier ===
                    longTermIdentifier
                    ? student.pseudonym
                    : null;
                } catch {
                  // we failed to decrypt the student, so we just return null as if the identity did not match
                  return null;
                }
              }),
            );

            // in case multiple students have the same long term identity, we take the first one
            // in practise this should never happen as this means that the same long term identity was encrypted
            // with the same key. this exact code is here to make sure that if there is an existing
            // student with the same long term identity, we assign them the same pseudonym
            const matchingPseudonym = matchingPseudonyms.find(
              (pseudonym) => pseudonym !== null,
            );

            const pseudonym = matchingPseudonym
              ? matchingPseudonym
              : encodeBase64(
                  await authContext.keyPair.encryptString(
                    JSON.stringify({
                      longTermIdentifier,
                      name,
                    } as StudentIdentity),
                  ),
                );

            const response = await authenticateStudent({
              classId: klass.id,
              pseudonym,
              keyPairId: authContext.keyPairId,
            });

            socket.emit("studentAuthenticationToken", {
              socketId,
              authenticationToken: encodeBase64(
                await ephemeralKey.encryptString(response.authenticationToken),
              ),
            });
          },
        );
      }
    },
    [authenticateStudent, fetchClass],
  );

  useEffect(() => {
    if (
      !isFullyAuthenticated(authContext) &&
      !isStudentLocallyAuthenticated(authContext)
    ) {
      return;
    }

    let webSocket: CollimatorSocket | null = null;

    const connectToWebSocket = async () => {
      const token: string | undefined = authContext.authenticationToken;

      webSocket = io(backendHostName, {
        auth: { token },
        transports: ["websocket"],
      });

      setupListeners(authContext, webSocket);

      webSocket.on("connect_error", async (error) => {
        console.error("WebSocket connection error", error);
      });

      setWebSocketState({ socket: webSocket });
    };

    connectToWebSocket();

    return () => {
      if (webSocket) {
        webSocket.disconnect();
      }
    };

    // we only ever want to (re-)connect when the auth context changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authContext]);

  return (
    <WebSocketContext.Provider value={webSocketState}>
      {children}
    </WebSocketContext.Provider>
  );
};

export default WebSocketProvider;
