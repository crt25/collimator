import { Test, TestingModule } from "@nestjs/testing";
import { DeepMockProxy, mockDeep } from "jest-mock-extended";
import { PrismaClient, Student } from "@prisma/client";
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

      expect(prismaMock.sessionTask.findUnique).not.toHaveBeenCalled();
    });

    it("denies a student that does not take part in the target session", async () => {
      prismaMock.sessionTask.findUnique.mockResolvedValue(null);

      await expect(
        service.canCreateStudentSolution(student, classId, sessionId, taskId),
      ).resolves.toBe(false);
    });

    it("allows a student that takes part in the target session", async () => {
      prismaMock.sessionTask.findUnique.mockResolvedValue({ taskId } as never);

      await expect(
        service.canCreateStudentSolution(student, classId, sessionId, taskId),
      ).resolves.toBe(true);
    });

    it("scopes the query to the class, session and task and requires participation", async () => {
      prismaMock.sessionTask.findUnique.mockResolvedValue({ taskId } as never);

      await service.canCreateStudentSolution(
        student,
        classId,
        sessionId,
        taskId,
      );

      expect(prismaMock.sessionTask.findUnique).toHaveBeenCalledWith({
        select: { taskId: true },
        where: {
          sessionId_taskId: { sessionId, taskId },
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
      expect(prismaMock.sessionTask.findUnique).not.toHaveBeenCalled();
    });

    it("allows an empty batch without querying the database", async () => {
      await expect(
        service.canTrackStudentActivities(student, []),
      ).resolves.toBe(true);

      expect(prismaMock.sessionTask.findMany).not.toHaveBeenCalled();
      expect(prismaMock.sessionTask.findUnique).not.toHaveBeenCalled();
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
});
