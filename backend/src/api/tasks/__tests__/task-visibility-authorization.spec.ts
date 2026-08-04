import { Test, TestingModule } from "@nestjs/testing";
import { DeepMockProxy, mockDeep } from "jest-mock-extended";
import { Prisma, PrismaClient, Student, User, UserType } from "@prisma/client";
import { ForbiddenException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { AuthorizationService } from "../../authorization/authorization.service";
import { TasksController } from "../tasks.controller";
import { TasksService } from "../tasks.service";

// A teacher could read any task by guessing its id: the task detail, download
// and with-reference-solutions endpoints never checked who was asking, so
// another teacher's private task - and its reference solutions, i.e. the
// answers - came straight back (CRT-460). Visibility must match what the list
// endpoint already grants: public tasks, plus your own, plus everything for an
// admin; a student instead sees the tasks of the sessions they take part in.

const taskId = 3;
const owner = { id: 10, type: UserType.TEACHER } as User;
const otherTeacher = { id: 11, type: UserType.TEACHER } as User;
const admin = { id: 12, type: UserType.ADMIN } as User;
const student: Student = { id: 8, deletedAt: null };

describe("Task visibility authorization", () => {
  describe("AuthorizationService.canViewTask", () => {
    let service: AuthorizationService;
    let prismaMock: DeepMockProxy<PrismaClient>;
    let module: TestingModule;

    beforeEach(async () => {
      prismaMock = mockDeep<PrismaClient>();

      module = await Test.createTestingModule({
        providers: [
          AuthorizationService,
          { provide: PrismaService, useValue: prismaMock },
        ],
      }).compile();

      service = module.get<AuthorizationService>(AuthorizationService);
    });

    afterEach(() => module.close());

    /**
     * Stands in for the task lookup: resolves a row only when the given
     * where-clause actually admits this task, so a query that forgets to
     * constrain visibility matches it - the behaviour under test.
     */
    const withTask = (task: {
      isPublic: boolean;
      creatorId: number | null;
    }): void => {
      const findFirst = (
        args: Prisma.TaskFindFirstArgs,
      ): { id: number } | null => {
        const where = args.where ?? {};
        // an alternative that does not constrain a field admits any value
        const matches = (where.OR ?? [where]).some(
          (alternative) =>
            (alternative.isPublic === undefined ||
              alternative.isPublic === task.isPublic) &&
            (alternative.creatorId === undefined ||
              alternative.creatorId === task.creatorId),
        );

        return matches ? { id: taskId } : null;
      };

      // `as never` (the convention in authorization.service.spec.ts) lets a
      // partial row stand in for the full model the delegate is typed to return
      prismaMock.task.findFirst.mockImplementation(findFirst as never);
    };

    it("denies a teacher another teacher's private task", async () => {
      withTask({ isPublic: false, creatorId: owner.id });

      await expect(
        service.canViewTask(otherTeacher, null, taskId),
      ).resolves.toBe(false);
    });

    it("allows the creator their own private task", async () => {
      withTask({ isPublic: false, creatorId: owner.id });

      await expect(service.canViewTask(owner, null, taskId)).resolves.toBe(
        true,
      );
    });

    it("allows any teacher a public task", async () => {
      withTask({ isPublic: true, creatorId: owner.id });

      await expect(
        service.canViewTask(otherTeacher, null, taskId),
      ).resolves.toBe(true);
    });

    it("allows an admin another user's private task", async () => {
      withTask({ isPublic: false, creatorId: owner.id });

      await expect(service.canViewTask(admin, null, taskId)).resolves.toBe(
        true,
      );
    });

    it("denies unauthenticated requests", async () => {
      await expect(service.canViewTask(null, null, taskId)).resolves.toBe(
        false,
      );
    });

    it("allows a student taking part in a session that uses the task", async () => {
      prismaMock.sessionTask.findFirst.mockResolvedValue({ taskId } as never);

      await expect(service.canViewTask(null, student, taskId)).resolves.toBe(
        true,
      );
    });

    it("allows a student who joined the lesson anonymously", async () => {
      // An anonymous participant is not on any class roster, so only the
      // anonymous branch of the participation check can authorize them.
      // @AuthenticatedStudent resolves them like any other student: it carries
      // the Student row of whoever holds the token, authenticated or anonymous.
      const findFirst = (
        args: Prisma.SessionTaskFindFirstArgs,
      ): { taskId: number } | null => {
        // the session filter is an XOR of a relation filter and a where input
        const session = (args.where?.session ?? {}) as Prisma.SessionWhereInput;

        const joinedAnonymously = (session.OR ?? []).some(
          (alternative) =>
            alternative.anonymousStudents?.some?.studentId === student.id,
        );

        return joinedAnonymously ? { taskId } : null;
      };

      prismaMock.sessionTask.findFirst.mockImplementation(findFirst as never);

      await expect(service.canViewTask(null, student, taskId)).resolves.toBe(
        true,
      );
    });

    it("denies a student a task from a session they do not take part in", async () => {
      prismaMock.sessionTask.findFirst.mockResolvedValue(null);

      await expect(service.canViewTask(null, student, taskId)).resolves.toBe(
        false,
      );
    });
  });

  describe("TasksController enforces it", () => {
    const buildController = (
      canView: boolean,
    ): { controller: TasksController; tasksService: MockTasksService } => {
      const tasksService = {
        findByIdOrThrow: jest.fn().mockResolvedValue({
          id: taskId,
          title: "t",
          description: "d",
          type: "SCRATCH",
          creatorId: owner.id,
          isPublic: false,
        }),
        findByIdOrThrowWithReferenceSolutions: jest.fn().mockResolvedValue({
          id: taskId,
          title: "t",
          description: "d",
          type: "SCRATCH",
          creatorId: owner.id,
          isPublic: false,
          referenceSolutions: [],
        }),
        downloadByIdOrThrow: jest
          .fn()
          .mockResolvedValue({ data: Buffer.from(""), mimeType: "text/plain" }),
        isTaskInUse: jest.fn().mockResolvedValue(false),
      };

      const authorizationService = {
        canViewTask: jest.fn().mockResolvedValue(canView),
      };

      const controller = new TasksController(
        tasksService as unknown as TasksService,
        authorizationService as unknown as AuthorizationService,
      );

      return { controller, tasksService };
    };

    it("refuses the task detail when the task is not visible", async () => {
      const { controller, tasksService } = buildController(false);

      await expect(
        controller.findOne(otherTeacher, null, taskId),
      ).rejects.toThrow(ForbiddenException);

      expect(tasksService.findByIdOrThrow).not.toHaveBeenCalled();
    });

    it("refuses the download when the task is not visible", async () => {
      const { controller, tasksService } = buildController(false);

      await expect(
        controller.downloadOne(otherTeacher, null, taskId),
      ).rejects.toThrow(ForbiddenException);

      expect(tasksService.downloadByIdOrThrow).not.toHaveBeenCalled();
    });

    it("refuses the reference solutions when the task is not visible", async () => {
      const { controller, tasksService } = buildController(false);

      await expect(
        controller.findOneWithReferenceSolutions(otherTeacher, taskId),
      ).rejects.toThrow(ForbiddenException);

      expect(
        tasksService.findByIdOrThrowWithReferenceSolutions,
      ).not.toHaveBeenCalled();
    });

    it("serves the task detail when the task is visible", async () => {
      const { controller, tasksService } = buildController(true);

      await expect(
        controller.findOne(owner, null, taskId),
      ).resolves.toBeDefined();

      expect(tasksService.findByIdOrThrow).toHaveBeenCalled();
    });
  });
});

type MockTasksService = {
  findByIdOrThrow: jest.Mock;
  findByIdOrThrowWithReferenceSolutions: jest.Mock;
  downloadByIdOrThrow: jest.Mock;
  isTaskInUse: jest.Mock;
};
