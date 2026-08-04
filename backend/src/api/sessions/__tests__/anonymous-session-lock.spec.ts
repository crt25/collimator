import { Test, TestingModule } from "@nestjs/testing";
import { AuthenticationProvider, UserType } from "@prisma/client";
import { CoreModule } from "src/core/core.module";
import { PrismaService } from "src/prisma/prisma.service";
import { mockConfigModule } from "src/utilities/test/mock-config.service";
import { SessionsService } from "../sessions.service";

// An anonymous lesson never admits the class's enrolled students - it hands
// out ad-hoc anonymous identities instead. Only its own anonymous participants
// may therefore lock it for editing; the class roster is irrelevant to it
// (CRT-439). These run against a real database so the lock is decided by
// Postgres evaluating the actual query, not by a hand-written stand-in.

describe("SessionsService — anonymous lessons ignore the class roster", () => {
  let service: SessionsService;
  let prisma: PrismaService;
  let module: TestingModule;

  let teacherId: number;
  let classId: number;
  let taskIds: number[];

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [CoreModule, mockConfigModule],
      providers: [SessionsService],
    }).compile();

    service = module.get<SessionsService>(SessionsService);
    prisma = module.get<PrismaService>(PrismaService);

    const teacher = await prisma.user.create({
      data: {
        email: `teacher-${Date.now()}-${Math.round(Math.random() * 1e9)}@example.com`,
        authenticationProvider: AuthenticationProvider.MICROSOFT,
        type: UserType.TEACHER,
      },
    });
    teacherId = teacher.id;

    const klass = await prisma.class.create({
      data: { name: "Test class", teacherId },
    });
    classId = klass.id;

    const tasks = await Promise.all(
      [0, 1].map((index) =>
        prisma.task.create({
          data: {
            title: `Task ${index}`,
            description: "A task for testing",
            type: "SCRATCH",
            mimeType: "application/json",
            data: Buffer.from("task-data"),
            creatorId: teacherId,
          },
        }),
      ),
    );
    taskIds = tasks.map(({ id }) => id);
  });

  afterEach(() => module.close());

  /** A lesson of this class, with its tasks attached. */
  const createSession = async (isAnonymous: boolean): Promise<number> => {
    const session = await prisma.session.create({
      data: {
        title: "Test lesson",
        description: "A lesson for testing",
        classId,
        isAnonymous,
        tasks: {
          create: taskIds.map((taskId, index) => ({ taskId, index })),
        },
      },
    });

    return session.id;
  };

  /** Enrols a student in the class, as joining a regular lesson would. */
  const enrolStudentInClass = async (): Promise<void> => {
    const student = await prisma.student.create({ data: {} });

    await prisma.authenticatedStudent.create({
      data: {
        studentId: student.id,
        classId,
        pseudonym: Buffer.from(`pseudonym-${student.id}`),
      },
    });
  };

  /** Joins a lesson anonymously, as an anonymous participant would. */
  const joinSessionAnonymously = async (sessionId: number): Promise<void> => {
    const student = await prisma.student.create({ data: {} });

    await prisma.anonymousStudent.create({
      data: { studentId: student.id, sessionId },
    });
  };

  describe("hasStudents", () => {
    it("is false for an anonymous lesson nobody joined, even with a full class", async () => {
      await enrolStudentInClass();
      const sessionId = await createSession(true);

      await expect(service.hasStudents(sessionId)).resolves.toBe(false);
    });

    it("is true for an anonymous lesson with anonymous participants", async () => {
      const sessionId = await createSession(true);
      await joinSessionAnonymously(sessionId);

      await expect(service.hasStudents(sessionId)).resolves.toBe(true);
    });

    it("is true for a regular lesson whose class has students", async () => {
      await enrolStudentInClass();
      const sessionId = await createSession(false);

      await expect(service.hasStudents(sessionId)).resolves.toBe(true);
    });

    it("is false for a regular lesson whose class is empty", async () => {
      const sessionId = await createSession(false);

      await expect(service.hasStudents(sessionId)).resolves.toBe(false);
    });

    it("ignores a student who already left the class", async () => {
      await enrolStudentInClass();
      await prisma.authenticatedStudent.updateMany({
        where: { classId },
        data: { deletedAt: new Date() },
      });
      const sessionId = await createSession(false);

      await expect(service.hasStudents(sessionId)).resolves.toBe(false);
    });
  });

  describe("update", () => {
    it("lets the teacher remove a task from an unjoined anonymous lesson", async () => {
      await enrolStudentInClass();
      const sessionId = await createSession(true);

      await expect(
        service.update(sessionId, { isAnonymous: true }, [taskIds[0]], classId),
      ).resolves.toBeDefined();

      const remaining = await prisma.sessionTask.findMany({
        where: { sessionId, deletedAt: null },
      });
      expect(remaining.map(({ taskId }) => taskId)).toEqual([taskIds[0]]);
    });

    it("lets the teacher change the sharing type of an unjoined anonymous lesson", async () => {
      await enrolStudentInClass();
      const sessionId = await createSession(true);

      await expect(
        service.update(sessionId, { isAnonymous: false }, taskIds, classId),
      ).resolves.toBeDefined();

      const updated = await prisma.session.findUniqueOrThrow({
        where: { id: sessionId },
      });
      expect(updated.isAnonymous).toBe(false);
    });

    it("still refuses to remove a task once anonymous students joined", async () => {
      const sessionId = await createSession(true);
      await joinSessionAnonymously(sessionId);

      await expect(
        service.update(sessionId, { isAnonymous: true }, [taskIds[0]], classId),
      ).rejects.toThrow(
        `Cannot remove tasks (ids: ${taskIds[1]}) from lesson (id: ${sessionId}) because students already joined it`,
      );
    });

    it("still refuses to remove a task from a regular lesson with students", async () => {
      await enrolStudentInClass();
      const sessionId = await createSession(false);

      await expect(
        service.update(
          sessionId,
          { isAnonymous: false },
          [taskIds[0]],
          classId,
        ),
      ).rejects.toThrow(
        `Cannot remove tasks (ids: ${taskIds[1]}) from lesson (id: ${sessionId}) because students already joined it`,
      );
    });

    it("still refuses to change the sharing type of a joined regular lesson", async () => {
      await enrolStudentInClass();
      const sessionId = await createSession(false);

      await expect(
        service.update(sessionId, { isAnonymous: true }, taskIds, classId),
      ).rejects.toThrow(
        `Cannot change the sharing type of lesson (id: ${sessionId}) because students already joined it`,
      );
    });
  });
});
