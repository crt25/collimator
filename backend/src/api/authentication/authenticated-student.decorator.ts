import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { studentRequestKey } from "./role.guard";
import { AuthenticationService } from "./authentication.service";

export const AuthenticatedStudent = createParamDecorator(
  (_data: unknown, context: ExecutionContext) =>
    AuthenticationService.getKeyFromContext(context, studentRequestKey),
);
