import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { Public } from "./role.decorator";
import { AuthenticationService } from "./authentication.service";

type Client = Socket;

@WebSocketGateway({
  // this cannot be configured using dependency injection
  // see https://github.com/nestjs/nest/issues/7649#issuecomment-964873444
  cors: true,
  transports: ["websocket"],
})
export class AuthenticationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  readonly socketsByUserId = new Map<number, Client[]>();

  @WebSocketServer() io!: Server;

  constructor(private readonly authenticationService: AuthenticationService) {}

  async handleConnection(client: Client): Promise<void> {
    const token = client.handshake.auth.token;

    if (!token) {
      return;
    }

    const user =
      await this.authenticationService.findByAuthenticationTokenOrThrow(token);

    if (user && !this.authenticationService.isStudent(user)) {
      const userId = user.id;
      if (!this.socketsByUserId.has(userId)) {
        this.socketsByUserId.set(userId, []);
      }

      this.socketsByUserId.get(userId)!.push(client);
    }
  }

  handleDisconnect(client: Client): void {
    const { user } = client.data;

    if (user) {
      const sockets = this.socketsByUserId.get(user.id);
      if (!sockets) {
        return;
      }

      const newSockets = sockets.filter((s) => s.id !== client.id);

      if (newSockets.length === 0) {
        this.socketsByUserId.delete(user.id);
      } else {
        this.socketsByUserId.set(user.id, newSockets);
      }
    }
  }

  @SubscribeMessage("requestTeacherToSignInStudent")
  @Public()
  requestTeacherToSignInStudent(
    client: Client,
    payload: { teacherId: number },
  ): void {
    const { teacherId, ...rest } = payload;
    const teacherSockets = this.socketsByUserId.get(teacherId);

    if (!teacherSockets) {
      throw new Error("Teacher not online");
    }

    // send the request to all teacher sockets
    // the teacher will respond to the socket that made the request
    // and the student will receive all responses but only look at the first one
    teacherSockets.forEach((socket) => {
      socket.emit("requestTeacherToSignInStudent", {
        ...rest,
        // tell the teacher which socket to respond to
        socketId: client.id,
      });
    });
  }

  @SubscribeMessage("studentAuthenticationToken")
  studentAuthenticationToken(
    _client: Client,
    payload: { socketId: string },
  ): void {
    const { socketId, ...rest } = payload;
    const studentSocket: Client | undefined =
      this.io.sockets.sockets.get(socketId);

    if (!studentSocket) {
      throw new Error(`Student with socket id ${socketId} is no longer online`);
    }

    studentSocket.emit("studentAuthenticationToken", rest);
  }
}
