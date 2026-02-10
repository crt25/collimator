import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Student, User, UserType } from "@prisma/client";
import { Reflector } from "@nestjs/core";
import { AuthenticationService } from "./authentication.service";
import {
  ALLOWED_ROLES,
  NonUserRoles,
  Role,
  SOFT_DELETE_ROLES,
} from "./role.decorator";
import { getTokenFromExecutionContext } from "./helpers";

export const userRequestKey = "user";
export const studentRequestKey = "student";

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private readonly authenticationService: AuthenticationService,
    private readonly reflector: Reflector,
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
      const user = await this.authenticationService.findUserByAuthTokenOrThrow(
        getTokenFromExecutionContext(context),
      );

      if (this.authenticationService.isStudent(user)) {
        if (!allowedRoles.includes(NonUserRoles.STUDENT)) {
          throw new ForbiddenException();
        }

        AuthenticationService.setKeyOnContext<Student>(
          context,
          studentRequestKey,
          user,
        );

        this.canSoftDeleteForStudent(context);
      } else {
        if (!allowedRoles.includes(user.type)) {
          throw new ForbiddenException();
        }

        AuthenticationService.setKeyOnContext<User>(
          context,
          userRequestKey,
          user,
        );

        this.canSoftDelete(context, user);
      }
    } catch (e) {
      if (e instanceof ForbiddenException) {
        throw e;
      }

      throw new UnauthorizedException();
    }

    return true;
  }

  private canSoftDelete(context: ExecutionContext, user: User): void {
    const softDeleteRoles = this.reflector.getAllAndOverride<UserType[]>(
      SOFT_DELETE_ROLES,
      [context.getHandler(), context.getClass()],
      // fallback to default roles if no roles are specified
    ) ?? this.defaultAllowedRoles;

    const request = context.switchToHttp().getRequest();
    const includeSoftDelete = request.query.includeSoftDelete === "true";

    if (!includeSoftDelete) {
      return;
    }

    if (!softDeleteRoles || !softDeleteRoles.includes(user.type)) {
      throw new ForbiddenException(
        "You do not have permission to view soft-deleted items",
      );
    }
  }

  private canSoftDeleteForStudent(context: ExecutionContext): void {
    const softDeleteRoles = this.reflector.getAllAndOverride<UserType[]>(
      SOFT_DELETE_ROLES,
      [context.getHandler(), context.getClass()],
    ) ?? this.defaultAllowedRoles;

    const request = context.switchToHttp().getRequest();
    const includeSoftDelete = request.query.includeSoftDelete === "true";

    if (!includeSoftDelete) {
      return;
    }

    if (softDeleteRoles) {
      throw new ForbiddenException(
        "You do not have permission to view soft-deleted items",
      );
    }
  }
}
