import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { userRequestKey } from "./role.guard";
import { AuthenticationService } from "./authentication.service";

export const AuthenticatedUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext) =>
    AuthenticationService.getKeyFromContext(context, userRequestKey),
);
