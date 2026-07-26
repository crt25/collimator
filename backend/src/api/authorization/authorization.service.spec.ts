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

      expect(prismaMock.sessionTask.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            sessionId_taskId: { sessionId, taskId },
            deletedAt: null,
            session: expect.objectContaining({
              classId,
              deletedAt: null,
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
            }),
          }),
        }),
      );
    });
  });

  describe("canTrackStudentActivities", () => {
    it("denies unauthenticated requests without querying the database", async () => {
      await expect(
        service.canTrackStudentActivities(null, [{ sessionId, taskId }]),
      ).resolves.toBe(false);

      expect(prismaMock.sessionTask.findUnique).not.toHaveBeenCalled();
    });

    it("denies the whole batch if a single activity is out of scope", async () => {
      prismaMock.sessionTask.findUnique
        .mockResolvedValueOnce({ taskId } as never)
        .mockResolvedValueOnce(null);

      await expect(
        service.canTrackStudentActivities(student, [
          { sessionId, taskId },
          { sessionId: 99, taskId: 99 },
        ]),
      ).resolves.toBe(false);
    });

    it("checks every distinct session/task pair exactly once", async () => {
      prismaMock.sessionTask.findUnique.mockResolvedValue({ taskId } as never);

      await expect(
        service.canTrackStudentActivities(student, [
          { sessionId, taskId },
          { sessionId, taskId },
          { sessionId, taskId: taskId + 1 },
        ]),
      ).resolves.toBe(true);

      expect(prismaMock.sessionTask.findUnique).toHaveBeenCalledTimes(2);
    });

    it("does not restrict the session to a class", async () => {
      prismaMock.sessionTask.findUnique.mockResolvedValue({ taskId } as never);

      await service.canTrackStudentActivities(student, [{ sessionId, taskId }]);

      const [[args]] = prismaMock.sessionTask.findUnique.mock.calls;

      expect(args?.where.session).not.toHaveProperty("classId");
    });
  });
});
