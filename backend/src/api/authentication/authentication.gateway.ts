import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { AuthenticatedGateway } from "./authenticated.gateway";
import { Server, Socket } from "socket.io";
import { Student, User } from "@prisma/client";
import { studentRequestKey, userRequestKey } from "./role.guard";
import { Public } from "./role.decorator";
import { AuthenticationService } from "./authentication.service";

type Client = Socket & {
  data: {
    [userRequestKey]: User | null;
    [studentRequestKey]: Student | null;
  };
};

@WebSocketGateway({
  // this cannot be configured using dependency injection
  // see https://github.com/nestjs/nest/issues/7649#issuecomment-964873444
  cors: true,
  transports: ["websocket"],
})
export class AuthenticationGateway
  extends AuthenticatedGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  readonly socketsByUserId = new Map<number, Client[]>();
  readonly socketsByStudentId = new Map<number, Client[]>();

  constructor(protected authenticationService: AuthenticationService) {
    super(authenticationService);
  }

  @WebSocketServer() io!: Server;

  handleConnection(client: Client): void {
    const { user, student } = client.data;

    if (user) {
      const userId = user.id;
      if (!this.socketsByUserId.has(userId)) {
        this.socketsByUserId.set(userId, []);
      }

      this.socketsByUserId.get(userId)!.push(client);
    } else if (student) {
      const studentId = student.id;
      if (!this.socketsByStudentId.has(studentId)) {
        this.socketsByStudentId.set(studentId, []);
      }

      this.socketsByStudentId.get(studentId)!.push(client);
    }
  }

  handleDisconnect(client: Client): void {
    const { user, student } = client.data;

    if (user) {
      this.socketsByUserId.delete(user.id);
    }

    if (student) {
      this.socketsByStudentId.delete(student.id);
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
      console.log(teacherId, this.socketsByUserId.keys(), payload);
      throw new Error("Teacher not online");
    }

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
