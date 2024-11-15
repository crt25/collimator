import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Request } from "express";
import { AuthenticationService } from "./authentication.service";
import { Student, User, UserType } from "@prisma/client";
import { ALLOWED_ROLES, NonUserRoles, Role } from "./role.decorator";
import { Reflector } from "@nestjs/core";

export const userRequestKey = "user";
export const studentRequestKey = "student";

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private authenticationService: AuthenticationService,
    private reflector: Reflector,
  ) {}

  // By default we allow only admins and teachers
  protected defaultAllowedRoles: Role[] = [UserType.ADMIN, UserType.TEACHER];

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Get the allowed roles from the metadata
    const allowedRoles =
      this.reflector.getAllAndOverride<Role[]>(ALLOWED_ROLES, [
        context.getHandler(),
        context.getClass(),
      ]) ??
      // And if no roles are specified, use the default roles
      this.defaultAllowedRoles;

    // If the UNAUTHENTICATED role is allowed, we don't need to check the token
    if (allowedRoles.includes(NonUserRoles.UNAUTHENTICATED)) {
      return true;
    }

    try {
      const user = await this.getUserFromContext(context);

      if (this.authenticationService.isStudent(user)) {
        if (!allowedRoles.includes(NonUserRoles.STUDENT)) {
          throw new ForbiddenException();
        }

        AuthenticationService.setKeyOnContext<Student>(
          context,
          studentRequestKey,
          user,
        );
      } else {
        if (!allowedRoles.includes(user.type)) {
          throw new ForbiddenException();
        }

        AuthenticationService.setKeyOnContext<User>(
          context,
          userRequestKey,
          user,
        );
      }
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }

  private async getUserFromContext(
    context: ExecutionContext,
  ): Promise<User | Student> {
    const type = context.getType();

    if (type === "http") {
      const request = context.switchToHttp().getRequest();
      const token = this.extractTokenFromHeader(request);

      if (!token) {
        throw new UnauthorizedException();
      }

      return this.authenticationService.findByAuthenticationTokenOrThrow(token);
    } else if (type === "ws") {
      const data = context.switchToWs().getData<{ user: User | Student }>();

      // This should never happen
      if (!data?.user) {
        throw new Error("Invariant voilation: Expected 'user' in context data");
      }

      return data.user;
    }

    throw new Error(`Unsupported context type '${type}'`);
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(" ") ?? [];
    return type === "Bearer" ? token : undefined;
  }
}
