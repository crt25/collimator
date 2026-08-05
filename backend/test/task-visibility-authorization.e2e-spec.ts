import { INestApplication } from "@nestjs/common";
import { Student, User, UserType } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import { AuthorizationService } from "src/api/authorization/authorization.service";
import { defaultAdmin, defaultTeacher } from "test/seed";
import { getApp } from "./helpers/index";
import { createUser } from "./helpers/user";
import { createClassWithId } from "./helpers/class";
import { createSessionWithId } from "./helpers/session";
import { createTask } from "./helpers/task";
import {
  createStudent,
  createAuthenticatedStudent,
  createAnonymousStudent,
} from "./helpers/student";

// A teacher could read any task by guessing its id: the task detail, download
// and with-reference-solutions endpoints never checked who was asking, so
// another teacher's private task - and its reference solutions, i.e. the
// answers - came straight back (CRT-460). Visibility must match what the list
// endpoint already grants: public tasks, plus your own, plus everything for an
// admin; a student instead sees the tasks of the sessions they take part in.
// These run under jest-prisma, so the rule is decided by Postgres and every
// test rolls back.
describe("AuthorizationService.canViewTask (e2e)", () => {
  let app: INestApplication;
  let service: AuthorizationService;
  let prisma: PrismaService;

  const owner = { id: defaultTeacher.id, type: UserType.TEACHER } as User;
  const admin = { id: defaultAdmin.id, type: UserType.ADMIN } as User;
  let otherTeacher: User;

  const taskId = 1301;
  const classId = 1201;
  const sessionId = 1401;

  beforeEach(async () => {
    app = await getApp();
    service = app.get(AuthorizationService, { strict: false });
    prisma = app.get(PrismaService);

    otherTeacher = await createUser(app, {
      id: 1103,
      type: UserType.TEACHER,
    });
  });

  afterEach(() => app.close());

  const createOwnedTask = (isPublic: boolean): Promise<unknown> =>
    createTask(app, { id: taskId, creatorId: owner.id, isPublic });

  /**
   * A lesson of a class containing the task, joined by a student - either
   * enrolled in the class or anonymously, as the sharing type decides.
   */
  const createStudentInLessonWith = async (
    joinAnonymously: boolean,
  ): Promise<Student> => {
    await createClassWithId(app, { id: classId, teacherId: owner.id });
    await createSessionWithId(app, {
      id: sessionId,
      classId,
      isAnonymous: joinAnonymously,
    });
    await prisma.sessionTask.create({ data: { sessionId, taskId, index: 0 } });

    const student = await createStudent(app, { id: 1501 });

    if (joinAnonymously) {
      await createAnonymousStudent(app, { studentId: student.id, sessionId });
    } else {
      await createAuthenticatedStudent(app, { studentId: student.id, classId });
    }

    return student;
  };

  it("denies a teacher another teacher's private task", async () => {
    await createOwnedTask(false);

    await expect(service.canViewTask(otherTeacher, null, taskId)).resolves.toBe(
      false,
    );
  });

  it("allows the creator their own private task", async () => {
    await createOwnedTask(false);

    await expect(service.canViewTask(owner, null, taskId)).resolves.toBe(true);
  });

  it("allows any teacher a public task", async () => {
    await createOwnedTask(true);

    await expect(service.canViewTask(otherTeacher, null, taskId)).resolves.toBe(
      true,
    );
  });

  it("allows an admin another user's private task", async () => {
    await createOwnedTask(false);

    await expect(service.canViewTask(admin, null, taskId)).resolves.toBe(true);
  });

  it("denies unauthenticated requests", async () => {
    await createOwnedTask(true);

    await expect(service.canViewTask(null, null, taskId)).resolves.toBe(false);
  });

  it("denies a teacher a soft-deleted task they created", async () => {
    await createOwnedTask(false);
    await prisma.task.update({
      where: { id: taskId },
      data: { deletedAt: new Date() },
    });

    await expect(service.canViewTask(owner, null, taskId)).resolves.toBe(false);
  });

  it("allows a student taking part in a lesson that uses the task", async () => {
    await createOwnedTask(false);
    const student = await createStudentInLessonWith(false);

    await expect(service.canViewTask(null, student, taskId)).resolves.toBe(
      true,
    );
  });

  it("allows a student who joined the lesson anonymously", async () => {
    // an anonymous participant is on no class roster, so only the anonymous
    // branch of the participation check can authorize them
    await createOwnedTask(false);
    const student = await createStudentInLessonWith(true);

    await expect(service.canViewTask(null, student, taskId)).resolves.toBe(
      true,
    );
  });

  it("denies a student the task once it is soft-deleted, even in an active lesson", async () => {
    // isStudentOfSessionTasks keeps a student *working* on a soft-deleted task
    // (submit/activity go through the SessionTask row), but the task detail and
    // download never exposed it: a student's fetch defaults to deletedAt: null
    // and 404s. canViewTask stays strict here so the outcome is a denial either
    // way - the student sees a 403 instead of that pre-existing 404, not new
    // access.
    await createOwnedTask(false);
    const student = await createStudentInLessonWith(false);

    await prisma.task.update({
      where: { id: taskId },
      data: { deletedAt: new Date() },
    });

    await expect(service.canViewTask(null, student, taskId)).resolves.toBe(
      false,
    );
  });

  it("denies a student a task from a lesson they do not take part in", async () => {
    await createOwnedTask(false);
    await createStudentInLessonWith(false);

    // a student who is not in that class or session
    const outsider = await createStudent(app, { id: 1502 });

    await expect(service.canViewTask(null, outsider, taskId)).resolves.toBe(
      false,
    );
  });

  it("denies a student once the task is removed from their lesson", async () => {
    await createOwnedTask(false);
    const student = await createStudentInLessonWith(false);

    await prisma.sessionTask.updateMany({
      where: { taskId },
      data: { deletedAt: new Date() },
    });

    await expect(service.canViewTask(null, student, taskId)).resolves.toBe(
      false,
    );
  });
});
