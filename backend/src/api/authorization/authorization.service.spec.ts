import { Test, TestingModule } from "@nestjs/testing";
import { DeepMockProxy, mockDeep } from "jest-mock-extended";
import { PrismaClient, Student, User, UserType } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import { AuthorizationService } from "./authorization.service";

describe("AuthorizationService", () => {
  let service: AuthorizationService;
  let prismaMock: DeepMockProxy<PrismaClient>;
  let module: TestingModule;

  const student: Student = { id: 8, deletedAt: null };

  const classId = 1;
  const sessionId = 2;
  const taskId = 3;
  const teacher = { id: 10, type: UserType.TEACHER } as User;
  const otherTeacher = { id: 11, type: UserType.TEACHER } as User;
  const admin = { id: 12, type: UserType.ADMIN } as User;

  beforeEach(async () => {
    prismaMock = mockDeep<PrismaClient>();

    module = await Test.createTestingModule({
      providers: [
        AuthorizationService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<AuthorizationService>(AuthorizationService);
  });

  afterEach(() => module.close());

  describe("canCreateStudentSolution", () => {
    it("denies unauthenticated requests without querying the database", async () => {
      await expect(
        service.canCreateStudentSolution(null, classId, sessionId, taskId),
      ).resolves.toBe(false);

      expect(prismaMock.sessionTask.findMany).not.toHaveBeenCalled();
    });

    it("denies a student that does not take part in the target session", async () => {
      prismaMock.sessionTask.findMany.mockResolvedValue([]);

      await expect(
        service.canCreateStudentSolution(student, classId, sessionId, taskId),
      ).resolves.toBe(false);
    });

    it("allows a student that takes part in the target session", async () => {
      prismaMock.sessionTask.findMany.mockResolvedValue([
        { sessionId, taskId },
      ] as never);

      await expect(
        service.canCreateStudentSolution(student, classId, sessionId, taskId),
      ).resolves.toBe(true);
    });

    it("scopes the query to the class, session and task and requires participation", async () => {
      prismaMock.sessionTask.findMany.mockResolvedValue([
        { sessionId, taskId },
      ] as never);

      await service.canCreateStudentSolution(
        student,
        classId,
        sessionId,
        taskId,
      );

      expect(prismaMock.sessionTask.findMany).toHaveBeenCalledWith({
        select: { sessionId: true, taskId: true },
        where: {
          OR: [{ sessionId, taskId }],
          deletedAt: null,
          session: {
            classId,
            deletedAt: null,
            class: { deletedAt: null },
            OR: [
              {
                anonymousStudents: {
                  some: { studentId: student.id, deletedAt: null },
                },
              },
              {
                class: {
                  deletedAt: null,
                  students: {
                    some: { studentId: student.id, deletedAt: null },
                  },
                },
              },
            ],
          },
        },
      });
    });
  });

  describe("canTrackStudentActivities", () => {
    it("denies unauthenticated requests without querying the database", async () => {
      await expect(
        service.canTrackStudentActivities(null, [{ sessionId, taskId }]),
      ).resolves.toBe(false);

      expect(prismaMock.sessionTask.findMany).not.toHaveBeenCalled();
    });

    it("allows an empty batch without querying the database", async () => {
      await expect(
        service.canTrackStudentActivities(student, []),
      ).resolves.toBe(true);

      expect(prismaMock.sessionTask.findMany).not.toHaveBeenCalled();
    });

    it("denies the whole batch if a single activity is out of scope", async () => {
      prismaMock.sessionTask.findMany.mockResolvedValue([
        { sessionId, taskId },
      ] as never);

      await expect(
        service.canTrackStudentActivities(student, [
          { sessionId, taskId },
          { sessionId: 99, taskId: 99 },
        ]),
      ).resolves.toBe(false);
    });

    it("checks all distinct session/task pairs in one query", async () => {
      prismaMock.sessionTask.findMany.mockResolvedValue([
        { sessionId, taskId },
        { sessionId, taskId: taskId + 1 },
      ] as never);

      await expect(
        service.canTrackStudentActivities(student, [
          { sessionId, taskId },
          { sessionId, taskId },
          { sessionId, taskId: taskId + 1 },
        ]),
      ).resolves.toBe(true);

      expect(prismaMock.sessionTask.findMany).toHaveBeenCalledTimes(1);

      const [[query]] = prismaMock.sessionTask.findMany.mock.calls;

      expect(query?.where?.OR).toEqual([
        { sessionId, taskId },
        { sessionId, taskId: taskId + 1 },
      ]);
    });

    it("requires active session tasks, sessions, classes and participation", async () => {
      prismaMock.sessionTask.findMany.mockResolvedValue([
        { sessionId, taskId },
      ] as never);

      await service.canTrackStudentActivities(student, [{ sessionId, taskId }]);

      expect(prismaMock.sessionTask.findMany).toHaveBeenCalledWith({
        select: { sessionId: true, taskId: true },
        where: {
          OR: [{ sessionId, taskId }],
          deletedAt: null,
          session: {
            deletedAt: null,
            class: { deletedAt: null },
            OR: [
              {
                anonymousStudents: {
                  some: { studentId: student.id, deletedAt: null },
                },
              },
              {
                class: {
                  deletedAt: null,
                  students: {
                    some: { studentId: student.id, deletedAt: null },
                  },
                },
              },
            ],
          },
        },
      });
    });
  });

  describe("canUpdateStudentReferenceSolution", () => {
    it("allows an admin without querying the database", async () => {
      await expect(
        service.canUpdateStudentReferenceSolution(admin, classId, sessionId),
      ).resolves.toBe(true);

      expect(prismaMock.session.findUnique).not.toHaveBeenCalled();
    });

    it("allows the teacher who owns the active class and session", async () => {
      prismaMock.session.findUnique.mockResolvedValue({
        id: sessionId,
      } as never);

      await expect(
        service.canUpdateStudentReferenceSolution(teacher, classId, sessionId),
      ).resolves.toBe(true);

      expect(prismaMock.session.findUnique).toHaveBeenCalledWith({
        select: { id: true },
        where: {
          id: sessionId,
          classId,
          deletedAt: null,
          class: {
            teacherId: teacher.id,
            deletedAt: null,
          },
        },
      });
    });

    it.each([
      ["wrong class", teacher, classId + 1],
      ["wrong teacher", otherTeacher, classId],
    ])(
      "denies an ownership mismatch: %s",
      async (_case, user, targetClassId) => {
        prismaMock.session.findUnique.mockResolvedValue(null);

        await expect(
          service.canUpdateStudentReferenceSolution(
            user,
            targetClassId,
            sessionId,
          ),
        ).resolves.toBe(false);

        expect(prismaMock.session.findUnique).toHaveBeenCalledWith({
          select: { id: true },
          where: {
            id: sessionId,
            classId: targetClassId,
            deletedAt: null,
            class: {
              teacherId: user.id,
              deletedAt: null,
            },
          },
        });
      },
    );

    it("denies when no active session and class match is found", async () => {
      prismaMock.session.findUnique.mockResolvedValue(null);

      await expect(
        service.canUpdateStudentReferenceSolution(teacher, classId, sessionId),
      ).resolves.toBe(false);
    });

    it("includes soft-deleted sessions and classes when requested", async () => {
      prismaMock.session.findUnique.mockResolvedValue({
        id: sessionId,
      } as never);

      await expect(
        service.canUpdateStudentReferenceSolution(
          teacher,
          classId,
          sessionId,
          true,
        ),
      ).resolves.toBe(true);

      expect(prismaMock.session.findUnique).toHaveBeenCalledWith({
        select: { id: true },
        where: {
          id: sessionId,
          classId,
          class: { teacherId: teacher.id },
        },
      });
    });
  });
});
