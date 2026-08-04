import { Test, TestingModule } from "@nestjs/testing";
import { AuthenticationProvider, UserType } from "@prisma/client";
import { CoreModule } from "src/core/core.module";
import { PrismaService } from "src/prisma/prisma.service";
import { mockConfigModule } from "src/utilities/test/mock-config.service";
import { SessionsService } from "src/api/sessions/sessions.service";
import {
  TasksService,
  TaskInOtherUsersLessonError,
  TaskInUseByClassOrLessonWithStudentsError,
} from "src/api/tasks/tasks.service";

// Removing a task from a lesson soft-deletes the SessionTask association: the
// row stays behind with deletedAt set. An "is this task still in use" query
// that does not exclude those rows keeps seeing lessons the task was already
// removed from, locking the task forever (CRT-445). These run against a real
// database, removing the task through SessionsService.update exactly as the
// lesson form does, so the soft-deleted row is produced by the application
// rather than hand-placed.

describe("TasksService.update — task removed from another teacher's lesson", () => {
  let tasksService: TasksService;
  let sessionsService: SessionsService;
  let prisma: PrismaService;
  let module: TestingModule;

  let ownerId: number;
  let otherTeacherId: number;

  const uniqueEmail = (prefix: string): string =>
    `${prefix}-${Date.now()}-${Math.round(Math.random() * 1e9)}@example.com`;

  const createTeacher = async (prefix: string): Promise<number> => {
    const teacher = await prisma.user.create({
      data: {
        email: uniqueEmail(prefix),
        authenticationProvider: AuthenticationProvider.MICROSOFT,
        type: UserType.TEACHER,
      },
    });

    return teacher.id;
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [CoreModule, mockConfigModule],
      providers: [TasksService, SessionsService],
    })
      .overrideProvider(PrismaService)
      .useFactory({ factory: () => jestPrisma.client })
      .compile();

    tasksService = module.get<TasksService>(TasksService);
    sessionsService = module.get<SessionsService>(SessionsService);
    prisma = module.get<PrismaService>(PrismaService);

    ownerId = await createTeacher("owner");
    otherTeacherId = await createTeacher("other-teacher");
  });

  afterEach(() => module.close());

  const createTask = async (isPublic: boolean): Promise<number> => {
    const task = await prisma.task.create({
      data: {
        title: "Shared task",
        description: "A task for testing",
        type: "SCRATCH",
        mimeType: "application/json",
        data: Buffer.from("task-data"),
        creatorId: ownerId,
        isPublic,
      },
    });

    return task.id;
  };

  /** A lesson of the other teacher's class, containing the given task. */
  const createLessonWithTask = async (
    taskId: number,
  ): Promise<{ sessionId: number; classId: number }> => {
    const klass = await prisma.class.create({
      data: { name: "Other teacher's class", teacherId: otherTeacherId },
    });

    const session = await prisma.session.create({
      data: {
        title: "Other teacher's lesson",
        description: "A lesson for testing",
        classId: klass.id,
        tasks: { create: [{ taskId, index: 0 }] },
      },
    });

    return { sessionId: session.id, classId: klass.id };
  };

  const enrolStudentInClass = async (classId: number): Promise<void> => {
    const student = await prisma.student.create({ data: {} });

    await prisma.authenticatedStudent.create({
      data: {
        studentId: student.id,
        classId,
        pseudonym: Buffer.from(`pseudonym-${student.id}`),
      },
    });
  };

  /** Removes every task from the lesson, as saving the lesson form does. */
  const removeTaskFromLesson = (
    sessionId: number,
    classId: number,
  ): Promise<unknown> => sessionsService.update(sessionId, {}, [], classId);

  const update = (taskId: number): Promise<unknown> =>
    tasksService.update(
      taskId,
      { title: "Updated title" },
      "application/json",
      new Uint8Array([1, 2, 3]),
      [],
      [],
    );

  it("allows updating a public task whose association was removed", async () => {
    const taskId = await createTask(true);
    const { sessionId, classId } = await createLessonWithTask(taskId);

    await removeTaskFromLesson(sessionId, classId);

    await expect(update(taskId)).resolves.toMatchObject({
      title: "Updated title",
    });
  });

  it("still refuses a public task that is in another teacher's lesson", async () => {
    const taskId = await createTask(true);
    await createLessonWithTask(taskId);

    await expect(update(taskId)).rejects.toBeInstanceOf(
      TaskInOtherUsersLessonError,
    );
  });

  it("allows updating a private task whose association was removed", async () => {
    // the same stale association must not trip the "lesson with students"
    // check once students join the class afterwards - a lesson may only lose
    // tasks while nobody has joined it yet
    const taskId = await createTask(false);
    const { sessionId, classId } = await createLessonWithTask(taskId);

    await removeTaskFromLesson(sessionId, classId);
    await enrolStudentInClass(classId);

    await expect(update(taskId)).resolves.toMatchObject({
      title: "Updated title",
    });
  });

  it("reports a removed association as not in use in the task list", async () => {
    const taskId = await createTask(false);
    const { sessionId, classId } = await createLessonWithTask(taskId);

    await removeTaskFromLesson(sessionId, classId);
    await enrolStudentInClass(classId);

    const tasks = await tasksService.findManyWithInUseStatus(false, ownerId);

    expect(tasks).toContainEqual(
      expect.objectContaining({ id: taskId, isInUse: false }),
    );
  });

  it("still refuses a task in a live lesson that has students", async () => {
    const taskId = await createTask(false);
    const { classId } = await createLessonWithTask(taskId);
    await enrolStudentInClass(classId);

    await expect(update(taskId)).rejects.toBeInstanceOf(
      TaskInUseByClassOrLessonWithStudentsError,
    );
  });
});
