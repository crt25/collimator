import { ExecutionContext, ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Student, User, UserType } from "@prisma/client";
import { RoleGuard } from "../authentication/role.guard";
import { AuthenticationService } from "../authentication/authentication.service";
import { ALLOWED_ROLES, Role } from "../authentication/role.decorator";
import { TasksController } from "./tasks.controller";

// The reference-solutions endpoint returns each reference solution's file and
// tests - the task's answer key - so it must be teacher/admin only. Enforcement
// is entirely the @Roles decorator read by the global RoleGuard, so this
// exercises the guard against the real controller metadata: a student is denied
// on GET :id/with-reference-solutions but still allowed on the plain GET :id
// they legitimately use.
describe("TasksController reference-solutions authorization", () => {
  const reflector = new Reflector();

  const buildGuard = (principal: User | Student): RoleGuard => {
    const authenticationService = {
      findUserByAuthTokenOrThrow: jest.fn().mockResolvedValue(principal),
      isStudent: jest
        .fn()
        .mockImplementation(
          (authenticatedPrincipal: User | Student) =>
            "authenticatedStudent" in authenticatedPrincipal ||
            "anonymousStudent" in authenticatedPrincipal,
        ),
    } as unknown as AuthenticationService;

    // a real Reflector so the guard reads the actual @Roles metadata off the
    // controller handlers below
    return new RoleGuard(authenticationService, reflector);
  };

  const contextForHandler = (
    handler: (...args: never[]) => unknown,
  ): ExecutionContext => {
    const request: Record<string, unknown> = {
      headers: { authorization: "Bearer test-token" },
      query: {},
    };

    return {
      getType: () => "http",
      getHandler: () => handler,
      getClass: () => TasksController,
      switchToHttp: () => ({
        getRequest: () => request,
        getResponse: () => ({}),
        getNext: () => ({}),
      }),
    } as unknown as ExecutionContext;
  };

  // isStudent() checks for an "authenticatedStudent"/"anonymousStudent" property
  const student = { id: 1, authenticatedStudent: {} } as unknown as Student;
  const teacher = { id: 2, type: UserType.TEACHER } as unknown as User;
  const admin = { id: 3, type: UserType.ADMIN } as unknown as User;

  const referenceSolutionsHandler =
    TasksController.prototype.findOneWithReferenceSolutions;
  const taskHandler = TasksController.prototype.findOne;

  it("scopes reference solutions to exactly teachers and admins", () => {
    const allowedRoles = reflector.get<Role[]>(
      ALLOWED_ROLES,
      referenceSolutionsHandler,
    );

    expect(allowedRoles).toHaveLength(2);
    expect(allowedRoles).toEqual(
      expect.arrayContaining([UserType.ADMIN, UserType.TEACHER]),
    );
  });

  it("denies a student reading a task's reference solutions", async () => {
    const guard = buildGuard(student);

    await expect(
      guard.canActivate(contextForHandler(referenceSolutionsHandler)),
    ).rejects.toThrow(ForbiddenException);
  });

  // positive control: the fix must scope the restriction to reference solutions
  // and must not lock students out of the task itself
  it("still allows a student to read the plain task", async () => {
    const guard = buildGuard(student);

    await expect(
      guard.canActivate(contextForHandler(taskHandler)),
    ).resolves.toBe(true);
  });

  it("allows a teacher to read reference solutions", async () => {
    const guard = buildGuard(teacher);

    await expect(
      guard.canActivate(contextForHandler(referenceSolutionsHandler)),
    ).resolves.toBe(true);
  });

  it("allows an admin to read reference solutions", async () => {
    const guard = buildGuard(admin);

    await expect(
      guard.canActivate(contextForHandler(referenceSolutionsHandler)),
    ).resolves.toBe(true);
  });
});
