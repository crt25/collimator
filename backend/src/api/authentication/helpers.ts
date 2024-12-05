import { ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { Request } from "express";
import { Socket } from "socket.io";

export const getTokenFromExecutionContext = (
  context: ExecutionContext,
): string => {
  const type = context.getType();

  if (type === "http") {
    const request = context.switchToHttp().getRequest();
    const token = extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException();
    }

    return token;
  } else if (type === "ws") {
    const socket: Socket = context.switchToWs().getClient();
    const token = socket.handshake.auth.token;

    if (!token || typeof token !== "string") {
      throw new UnauthorizedException();
    }

    return token;
  }

  throw new Error(`Unsupported context type '${type}'`);
};

const extractTokenFromHeader = (request: Request): string | undefined => {
  const [type, token] = request.headers.authorization?.split(" ") ?? [];
  return type === "Bearer" ? token : undefined;
};
