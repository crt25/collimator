import { CustomDecorator, SetMetadata } from "@nestjs/common";
import { UserType } from "@prisma/client";

export const ALLOWED_ROLES = "allowedRoles";
export const SOFT_DELETE_ROLES = "softDeleteRoles";

export enum NonUserRoles {
  UNAUTHENTICATED = "UNAUTHENTICATED",
  STUDENT = "STUDENT",
}

export type Role = UserType | NonUserRoles;

export const Roles = (allowedUserTypes: Role[]): CustomDecorator<string> =>
  SetMetadata(ALLOWED_ROLES, allowedUserTypes);

export const Public = (): CustomDecorator<string> =>
  Roles([NonUserRoles.UNAUTHENTICATED]);

export const AdminOnly = (): CustomDecorator<string> => Roles([UserType.ADMIN]);

export const StudentOnly = (): CustomDecorator<string> =>
  Roles([NonUserRoles.STUDENT]);

export const RequiresSoftDeletePermission = (): CustomDecorator<string> =>
  SetMetadata(SOFT_DELETE_ROLES, [UserType.TEACHER, UserType.ADMIN]);
