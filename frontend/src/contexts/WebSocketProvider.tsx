import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { io } from "socket.io-client";
import {
  AuthenticationContext,
  AuthenticationContextType,
} from "./AuthenticationContext";
import { backendHostName } from "@/utilities/constants";
import { CollimatorSocket } from "@/types/websocket-events";
import { UserRole } from "@/types/user/user-role";
import { useHandleStudentAuthenticationRequest } from "@/hooks/useHandleStudentAuthenticationRequest";

const logModule = "[WebSocketProvider]";

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

  const handleStudentAuthenticationRequest =
    useHandleStudentAuthenticationRequest();

  const setupListeners = useCallback(
    (authContext: AuthenticationContextType, socket: CollimatorSocket) => {
      if (
        authContext.role !== UserRole.admin &&
        authContext.role !== UserRole.teacher
      ) {
        return;
      }

      socket.on("requestTeacherToSignInStudent", async (message) => {
        socket.emit(
          "studentAuthenticationToken",
          await handleStudentAuthenticationRequest(authContext, message),
        );
      });
    },
    [handleStudentAuthenticationRequest],
  );

  useEffect(() => {
    let webSocket: CollimatorSocket | null = null;

    const connectToWebSocket = async () => {
      const token: string | undefined = authContext.authenticationToken;

      webSocket = io(backendHostName, {
        auth: { token },
        transports: ["websocket"],
      });

      setupListeners(authContext, webSocket);

      webSocket.on("connect_error", async (error) => {
        console.error(`${logModule} connection error`, error);
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
