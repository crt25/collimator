import { Test, TestingModule } from "@nestjs/testing";
import {
  AuthenticationProvider,
  Student,
  User,
  UserType,
} from "@prisma/client";
import { ForbiddenException } from "@nestjs/common";
import { CoreModule } from "src/core/core.module";
import { PrismaService } from "src/prisma/prisma.service";
import { mockConfigModule } from "src/utilities/test/mock-config.service";
import { AuthorizationService } from "../../authorization/authorization.service";
import { TasksController } from "../tasks.controller";
import { TasksService } from "../tasks.service";

// A teacher could read any task by guessing its id: the task detail, download
// and with-reference-solutions endpoints never checked who was asking, so
// another teacher's private task - and its reference solutions, i.e. the
// answers - came straight back (CRT-460). Visibility must match what the list
// endpoint already grants: public tasks, plus your own, plus everything for an
// admin; a student instead sees the tasks of the sessions they take part in.

describe("Task visibility authorization", () => {
  describe("AuthorizationService.canViewTask", () => {
    let service: AuthorizationService;
    let prisma: PrismaService;
    let module: TestingModule;

    let owner: User;
    let otherTeacher: User;
    let admin: User;

    const uniqueEmail = (prefix: string): string =>
      `${prefix}-${Date.now()}-${Math.round(Math.random() * 1e9)}@example.com`;

    const createUser = (prefix: string, type: UserType): Promise<User> =>
      prisma.user.create({
        data: {
          email: uniqueEmail(prefix),
          authenticationProvider: AuthenticationProvider.MICROSOFT,
          type,
        },
      });

    beforeEach(async () => {
      module = await Test.createTestingModule({
        imports: [CoreModule, mockConfigModule],
        providers: [AuthorizationService],
      }).compile();

      service = module.get<AuthorizationService>(AuthorizationService);
      prisma = module.get<PrismaService>(PrismaService);

      owner = await createUser("owner", UserType.TEACHER);
      otherTeacher = await createUser("other-teacher", UserType.TEACHER);
      admin = await createUser("admin", UserType.ADMIN);
    });

    afterEach(() => module.close());

    const createTask = async (isPublic: boolean): Promise<number> => {
      const task = await prisma.task.create({
        data: {
          title: "A task",
          description: "A task for testing",
          type: "SCRATCH",
          mimeType: "application/json",
          data: Buffer.from("task-data"),
          creatorId: owner.id,
          isPublic,
        },
      });

      return task.id;
    };

    /**
     * A lesson of the owner's class containing the task, joined by a student -
     * either enrolled in the class or anonymously, as the sharing type decides.
     */
    const createStudentInLessonWith = async (
      taskId: number,
      joinAnonymously: boolean,
    ): Promise<Student> => {
      const klass = await prisma.class.create({
        data: { name: "A class", teacherId: owner.id },
      });

      const session = await prisma.session.create({
        data: {
          title: "A lesson",
          description: "A lesson for testing",
          classId: klass.id,
          isAnonymous: joinAnonymously,
          tasks: { create: [{ taskId, index: 0 }] },
        },
      });

      const student = await prisma.student.create({ data: {} });

      if (joinAnonymously) {
        await prisma.anonymousStudent.create({
          data: { studentId: student.id, sessionId: session.id },
        });
      } else {
        await prisma.authenticatedStudent.create({
          data: {
            studentId: student.id,
            classId: klass.id,
            pseudonym: Buffer.from(`pseudonym-${student.id}`),
          },
        });
      }

      return student;
    };

    it("denies a teacher another teacher's private task", async () => {
      const taskId = await createTask(false);

      await expect(
        service.canViewTask(otherTeacher, null, taskId),
      ).resolves.toBe(false);
    });

    it("allows the creator their own private task", async () => {
      const taskId = await createTask(false);

      await expect(service.canViewTask(owner, null, taskId)).resolves.toBe(
        true,
      );
    });

    it("allows any teacher a public task", async () => {
      const taskId = await createTask(true);

      await expect(
        service.canViewTask(otherTeacher, null, taskId),
      ).resolves.toBe(true);
    });

    it("allows an admin another user's private task", async () => {
      const taskId = await createTask(false);

      await expect(service.canViewTask(admin, null, taskId)).resolves.toBe(
        true,
      );
    });

    it("denies unauthenticated requests", async () => {
      const taskId = await createTask(true);

      await expect(service.canViewTask(null, null, taskId)).resolves.toBe(
        false,
      );
    });

    it("denies a teacher a soft-deleted task they created", async () => {
      const taskId = await createTask(false);
      await prisma.task.update({
        where: { id: taskId },
        data: { deletedAt: new Date() },
      });

      await expect(service.canViewTask(owner, null, taskId)).resolves.toBe(
        false,
      );
    });

    it("allows a student taking part in a lesson that uses the task", async () => {
      const taskId = await createTask(false);
      const student = await createStudentInLessonWith(taskId, false);

      await expect(service.canViewTask(null, student, taskId)).resolves.toBe(
        true,
      );
    });

    it("allows a student who joined the lesson anonymously", async () => {
      // an anonymous participant is on no class roster, so only the anonymous
      // branch of the participation check can authorize them
      const taskId = await createTask(false);
      const student = await createStudentInLessonWith(taskId, true);

      await expect(service.canViewTask(null, student, taskId)).resolves.toBe(
        true,
      );
    });

    it("denies a student a task from a lesson they do not take part in", async () => {
      const taskId = await createTask(false);
      await createStudentInLessonWith(taskId, false);

      // a student of some other lesson entirely
      const outsider = await prisma.student.create({ data: {} });

      await expect(service.canViewTask(null, outsider, taskId)).resolves.toBe(
        false,
      );
    });

    it("denies a student once the task is removed from their lesson", async () => {
      const taskId = await createTask(false);
      const student = await createStudentInLessonWith(taskId, false);

      await prisma.sessionTask.updateMany({
        where: { taskId },
        data: { deletedAt: new Date() },
      });

      await expect(service.canViewTask(null, student, taskId)).resolves.toBe(
        false,
      );
    });
  });

  // The controller only has to refuse when the check says no; which tasks are
  // visible is settled against the database above.
  describe("TasksController enforces it", () => {
    const taskId = 3;
    const teacher = { id: 11, type: UserType.TEACHER } as User;

    const buildController = (
      canView: boolean,
    ): { controller: TasksController; tasksService: MockTasksService } => {
      const tasksService = {
        findByIdOrThrow: jest.fn().mockResolvedValue({
          id: taskId,
          title: "t",
          description: "d",
          type: "SCRATCH",
          creatorId: 10,
          isPublic: false,
        }),
        findByIdOrThrowWithReferenceSolutions: jest.fn().mockResolvedValue({
          id: taskId,
          title: "t",
          description: "d",
          type: "SCRATCH",
          creatorId: 10,
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

      await expect(controller.findOne(teacher, null, taskId)).rejects.toThrow(
        ForbiddenException,
      );

      expect(tasksService.findByIdOrThrow).not.toHaveBeenCalled();
    });

    it("refuses the download when the task is not visible", async () => {
      const { controller, tasksService } = buildController(false);

      await expect(
        controller.downloadOne(teacher, null, taskId),
      ).rejects.toThrow(ForbiddenException);

      expect(tasksService.downloadByIdOrThrow).not.toHaveBeenCalled();
    });

    it("refuses the reference solutions when the task is not visible", async () => {
      const { controller, tasksService } = buildController(false);

      await expect(
        controller.findOneWithReferenceSolutions(teacher, taskId),
      ).rejects.toThrow(ForbiddenException);

      expect(
        tasksService.findByIdOrThrowWithReferenceSolutions,
      ).not.toHaveBeenCalled();
    });

    it("serves the task detail when the task is visible", async () => {
      const { controller, tasksService } = buildController(true);

      await expect(
        controller.findOne(teacher, null, taskId),
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
