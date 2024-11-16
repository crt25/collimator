import { ConnectedSocket, OnGatewayInit } from "@nestjs/websockets";
import { Socket } from "socket.io";
import { AuthenticationService } from "./authentication.service";

export abstract class AuthenticatedGateway implements OnGatewayInit {
  constructor(protected authenticationService: AuthenticationService) {}

  async afterInit(@ConnectedSocket() socket: Socket): Promise<void> {
    socket.use(this.checkAuthentication.bind(this));
  }

  private async checkAuthentication(
    socket: Socket,
    next: (err?: Error) => void,
  ): Promise<void> {
    try {
      const token = socket.handshake.auth.token;
      if (!token || typeof token !== "string") {
        return next();
      }

      const user =
        await this.authenticationService.findByAuthenticationTokenOrThrow(
          token,
        );

      // Set the user on the socket so that the role guard can use it
      socket.data.user = user;
      return next();
    } catch {
      next(new Error("unauthorized"));
    }
  }
}
