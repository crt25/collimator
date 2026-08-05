import { INestApplication } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { SessionsService } from "src/api/sessions/sessions.service";
import { defaultTeacher } from "test/seed";
import { getApp } from "./helpers/index";
import { createClassWithId } from "./helpers/class";
import { createSessionWithId } from "./helpers/session";
import {
  createStudent,
  createAuthenticatedStudent,
  createAnonymousStudent,
} from "./helpers/student";
import { createTask } from "./helpers/task";

// An anonymous lesson never admits the class's enrolled students - it hands out
// ad-hoc anonymous identities instead. Only its own anonymous participants may
// therefore lock it for editing; the class roster is irrelevant to it
// (CRT-439). These run under jest-prisma, so the lock is decided by Postgres
// evaluating the real query, and every test rolls back.
describe("SessionsService - anonymous lessons ignore the class roster (e2e)", () => {
  let app: INestApplication;
  let service: SessionsService;
  let prisma: PrismaService;

  const classId = 1201;
  const taskIds = [1301, 1302];
  const sessionId = 1401;
  let nextStudentId = 1500;

  beforeEach(async () => {
    app = await getApp();
    service = app.get(SessionsService, { strict: false });
    prisma = app.get(PrismaService);

    await createClassWithId(app, { id: classId, teacherId: defaultTeacher.id });
    await Promise.all(
      taskIds.map((id) =>
        createTask(app, { id, creatorId: defaultTeacher.id }),
      ),
    );
  });

  afterEach(() => app.close());

  /** A lesson of the class, with its tasks attached. */
  const createSession = async (isAnonymous: boolean): Promise<void> => {
    await createSessionWithId(app, { id: sessionId, classId, isAnonymous });
    await prisma.sessionTask.createMany({
      data: taskIds.map((taskId, index) => ({ sessionId, taskId, index })),
    });
  };

  /** Enrols a student in the class, as joining a regular lesson would. */
  const enrolStudentInClass = async (): Promise<number> => {
    const studentId = ++nextStudentId;
    await createStudent(app, { id: studentId });
    await createAuthenticatedStudent(app, { studentId, classId });
    return studentId;
  };

  /** Joins the lesson anonymously, as an anonymous participant would. */
  const joinSessionAnonymously = async (): Promise<void> => {
    const studentId = ++nextStudentId;
    await createStudent(app, { id: studentId });
    await createAnonymousStudent(app, { studentId, sessionId });
  };

  describe("hasStudents", () => {
    it("is false for an anonymous lesson nobody joined, even with a full class", async () => {
      await enrolStudentInClass();
      await createSession(true);

      await expect(service.hasStudents(sessionId)).resolves.toBe(false);
    });

    it("is true for an anonymous lesson with anonymous participants", async () => {
      await createSession(true);
      await joinSessionAnonymously();

      await expect(service.hasStudents(sessionId)).resolves.toBe(true);
    });

    it("is true for a regular lesson whose class has students", async () => {
      await enrolStudentInClass();
      await createSession(false);

      await expect(service.hasStudents(sessionId)).resolves.toBe(true);
    });

    it("is false for a regular lesson whose class is empty", async () => {
      await createSession(false);

      await expect(service.hasStudents(sessionId)).resolves.toBe(false);
    });

    it("ignores a student who already left the class", async () => {
      await enrolStudentInClass();
      await prisma.authenticatedStudent.updateMany({
        where: { classId },
        data: { deletedAt: new Date() },
      });
      await createSession(false);

      await expect(service.hasStudents(sessionId)).resolves.toBe(false);
    });
  });

  describe("update", () => {
    it("lets the teacher remove a task from an unjoined anonymous lesson", async () => {
      await enrolStudentInClass();
      await createSession(true);

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
      await createSession(true);

      await expect(
        service.update(sessionId, { isAnonymous: false }, taskIds, classId),
      ).resolves.toBeDefined();

      const updated = await prisma.session.findUniqueOrThrow({
        where: { id: sessionId },
      });
      expect(updated.isAnonymous).toBe(false);
    });

    it("still refuses to remove a task once anonymous students joined", async () => {
      await createSession(true);
      await joinSessionAnonymously();

      await expect(
        service.update(sessionId, { isAnonymous: true }, [taskIds[0]], classId),
      ).rejects.toThrow(
        `Cannot remove tasks (ids: ${taskIds[1]}) from lesson (id: ${sessionId}) because students already joined it`,
      );
    });

    it("still refuses to remove a task from a regular lesson with students", async () => {
      await enrolStudentInClass();
      await createSession(false);

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
      await createSession(false);

      await expect(
        service.update(sessionId, { isAnonymous: true }, taskIds, classId),
      ).rejects.toThrow(
        `Cannot change the sharing type of lesson (id: ${sessionId}) because students already joined it`,
      );
    });
  });
});
