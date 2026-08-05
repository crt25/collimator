import { PrismaService } from "src/prisma/prisma.service";
import {
  TaskInOtherUsersLessonError,
  TaskInUseByClassOrLessonWithStudentsError,
  TasksService,
  TaskUpdateInput,
} from "./tasks.service";

// TasksService.update refuses to edit a public task that another user's lesson
// depends on (the same rule deleteById already enforces), and must otherwise
// persist the caller's field changes. Both are exercised here by driving
// update() with a mocked Prisma: $transaction runs the callback against a mock
// tx, task.findUniqueOrThrow yields the task's isPublic/creatorId, and
// sessionTask.findFirst stands in for the "used by other users" / "used by a
// lesson with students" checks (called in that order for a public task).
describe("TasksService.update", () => {
  const taskId = 1;
  const taskData = new Uint8Array([1, 2, 3]);
  const updatedTask = { id: taskId };
  const studentUsageQuery = {
    where: {
      taskId,
      deletedAt: null,
      task: { deletedAt: null },
      session: {
        deletedAt: null,
        OR: [
          {
            anonymousStudents: {
              some: { deletedAt: null },
            },
          },
          {
            class: {
              deletedAt: null,
              students: {
                some: { deletedAt: null },
              },
            },
          },
        ],
      },
    },
  };

  const buildService = (opts: {
    isPublic: boolean;
    creatorId: number | null;
    inUseByOthers: boolean;
    inUseByStudents: boolean;
  }): { service: TasksService; tx: MockTx } => {
    const findFirst = jest.fn();
    if (opts.isPublic) {
      // first call: used by other users; second: used by a lesson with students
      findFirst
        .mockResolvedValueOnce(opts.inUseByOthers ? { id: taskId } : null)
        .mockResolvedValueOnce(opts.inUseByStudents ? { id: taskId } : null);
    } else {
      // the other-users check is skipped, so findFirst is only the student one
      findFirst.mockResolvedValueOnce(
        opts.inUseByStudents ? { id: taskId } : null,
      );
    }

    const tx = {
      task: {
        findUniqueOrThrow: jest.fn().mockResolvedValue({
          isPublic: opts.isPublic,
          creatorId: opts.creatorId,
        }),
        update: jest.fn().mockResolvedValue(updatedTask),
      },
      sessionTask: { findFirst },
      referenceSolution: { deleteMany: jest.fn().mockResolvedValue({}) },
      solution: {
        deleteMany: jest.fn().mockResolvedValue({}),
        createMany: jest.fn().mockResolvedValue({}),
      },
    };

    const prisma = {
      $transaction: jest.fn((callback: (client: MockTx) => Promise<unknown>) =>
        callback(tx),
      ),
    } as unknown as PrismaService;

    return { service: new TasksService(prisma), tx };
  };

  const update = (
    service: TasksService,
    task: TaskUpdateInput,
    includeSoftDelete = false,
  ): Promise<unknown> =>
    // no reference solutions, so the pre-transaction hashing is a no-op
    service.update(
      taskId,
      task,
      "application/json",
      taskData,
      [],
      [],
      includeSoftDelete,
    );

  const expectNoWrites = (tx: MockTx): void => {
    expect(tx.referenceSolution.deleteMany).not.toHaveBeenCalled();
    expect(tx.solution.deleteMany).not.toHaveBeenCalled();
    expect(tx.solution.createMany).not.toHaveBeenCalled();
    expect(tx.task.update).not.toHaveBeenCalled();
  };

  it("refuses to edit a public task another user's lesson depends on", async () => {
    const { service, tx } = buildService({
      isPublic: true,
      creatorId: 7,
      inUseByOthers: true,
      inUseByStudents: false,
    });

    await expect(update(service, { title: "rewritten" })).rejects.toThrow(
      TaskInOtherUsersLessonError,
    );

    expect(tx.sessionTask.findFirst).toHaveBeenCalledTimes(1);
    expect(tx.sessionTask.findFirst).toHaveBeenCalledWith({
      where: {
        taskId,
        deletedAt: null,
        session: {
          deletedAt: null,
          class: {
            teacherId: { not: 7 },
            deletedAt: null,
          },
        },
      },
    });
    expectNoWrites(tx);
  });

  it("does not apply the other-users rule to a public task no one else uses", async () => {
    const { service, tx } = buildService({
      isPublic: true,
      creatorId: 7,
      inUseByOthers: false,
      inUseByStudents: true,
    });

    // reaching the students-in-use check (a different error) proves the
    // other-users guard let this through rather than blocking it
    await expect(update(service, { title: "rewritten" })).rejects.toThrow(
      TaskInUseByClassOrLessonWithStudentsError,
    );

    expect(tx.sessionTask.findFirst).toHaveBeenCalledTimes(2);
    expect(tx.sessionTask.findFirst).toHaveBeenNthCalledWith(1, {
      where: {
        taskId,
        deletedAt: null,
        session: {
          deletedAt: null,
          class: {
            teacherId: { not: 7 },
            deletedAt: null,
          },
        },
      },
    });

    expect(tx.sessionTask.findFirst).toHaveBeenNthCalledWith(
      2,
      studentUsageQuery,
    );

    expectNoWrites(tx);
  });

  it("does not apply the other-users rule to a private task", async () => {
    const { service, tx } = buildService({
      isPublic: false,
      creatorId: 7,
      inUseByOthers: true, // irrelevant: the check is skipped for private tasks
      inUseByStudents: true,
    });

    await expect(update(service, { title: "rewritten" })).rejects.toThrow(
      TaskInUseByClassOrLessonWithStudentsError,
    );

    expect(tx.sessionTask.findFirst).toHaveBeenCalledTimes(1);
    expect(tx.sessionTask.findFirst).toHaveBeenCalledWith(studentUsageQuery);

    expectNoWrites(tx);
  });

  it("persists the caller's field changes on a permitted update", async () => {
    const { service, tx } = buildService({
      isPublic: false,
      creatorId: 7,
      inUseByOthers: false,
      inUseByStudents: false,
    });

    await expect(
      update(service, { title: "rewritten", description: "new" }),
    ).resolves.toEqual(updatedTask);

    expect(tx.task.findUniqueOrThrow).toHaveBeenCalledWith({
      where: { id: taskId, deletedAt: null },
      select: { isPublic: true, creatorId: true },
    });

    // guards against the parameter being shadowed by the fetched task, which
    // would silently drop the caller's field changes from the write
    expect(tx.task.update).toHaveBeenCalledWith({
      data: {
        title: "rewritten",
        description: "new",
        mimeType: "application/json",
        data: taskData,
        referenceSolutions: {
          create: [],
          update: [],
        },
      },
      where: { id: taskId },
      omit: { data: true },
    });
  });
});

type MockTx = {
  task: { findUniqueOrThrow: jest.Mock; update: jest.Mock };
  sessionTask: { findFirst: jest.Mock };
  referenceSolution: { deleteMany: jest.Mock };
  solution: { deleteMany: jest.Mock; createMany: jest.Mock };
};
