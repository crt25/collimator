import { PrismaService } from "src/prisma/prisma.service";
import {
  TasksService,
  TaskInOtherUsersLessonError,
  TaskInUseByClassOrLessonWithStudentsError,
} from "../tasks.service";

// Removing a task from a lesson soft-deletes the SessionTask association: the
// row stays, with deletedAt set. The soft-delete Prisma extension only rewrites
// deletes, it does not filter reads, so an "is this task still in use" query
// that omits `deletedAt: null` keeps seeing lessons the task was already
// removed from - locking the task forever (CRT-445).
//
// These drive TasksService.update() against a mocked Prisma whose
// sessionTask.findFirst evaluates the where-clause it is given against a small
// fixture, rather than asserting a literal clause: a query that forgets the
// soft-delete filter really does match the removed association here, exactly
// as it would against Postgres.

const taskId = 42;
const creatorId = 1;
const otherTeacherId = 2;

type SessionTaskRow = {
  taskId: number;
  deletedAt: Date | null;
  session: {
    deletedAt: Date | null;
    class: { teacherId: number; deletedAt: Date | null };
    hasAnonymousStudents: boolean;
    hasClassStudents: boolean;
  };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Where = any;

/**
 * Minimal stand-in for Prisma's filtering, supporting exactly the fields the
 * two in-use queries use. Anything the query does not constrain is ignored,
 * so a missing filter matches more rows - the behaviour under test.
 */
const rowMatches = (row: SessionTaskRow, where: Where): boolean => {
  if (where.taskId !== undefined && where.taskId !== row.taskId) {
    return false;
  }

  if (where.deletedAt === null && row.deletedAt !== null) {
    return false;
  }

  if (where.task?.deletedAt === null && row.deletedAt !== null) {
    // the task itself is alive in these fixtures; only the association differs
    return true;
  }

  const session = where.session;

  if (!session) {
    return true;
  }

  if (session.deletedAt === null && row.session.deletedAt !== null) {
    return false;
  }

  if (session.class) {
    if (
      session.class.deletedAt === null &&
      row.session.class.deletedAt !== null
    ) {
      return false;
    }

    const teacherId = session.class.teacherId;
    if (
      teacherId?.not !== undefined &&
      row.session.class.teacherId === teacherId.not
    ) {
      return false;
    }
  }

  if (Array.isArray(session.OR)) {
    const matchesAnyBranch = session.OR.some((branch: Where) => {
      if (branch.anonymousStudents) {
        return row.session.hasAnonymousStudents;
      }
      if (branch.class?.students) {
        return row.session.hasClassStudents;
      }
      return false;
    });

    if (!matchesAnyBranch) {
      return false;
    }
  }

  return true;
};

const buildService = (
  rows: SessionTaskRow[],
  isPublic: boolean,
): TasksService => {
  const tx = {
    task: {
      findUniqueOrThrow: jest.fn().mockResolvedValue({ isPublic, creatorId }),
      update: jest.fn().mockResolvedValue({ id: taskId }),
    },
    sessionTask: {
      findFirst: jest.fn(({ where }: { where: Where }) =>
        Promise.resolve(rows.find((row) => rowMatches(row, where)) ?? null),
      ),
    },
    referenceSolution: {
      deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
    },
    solution: {
      deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
      createMany: jest.fn().mockResolvedValue({ count: 0 }),
    },
  };

  const prisma = {
    $transaction: jest.fn((callback: (client: typeof tx) => Promise<unknown>) =>
      callback(tx),
    ),
  } as unknown as PrismaService;

  return new TasksService(prisma);
};

const update = (service: TasksService): Promise<unknown> =>
  service.update(
    taskId,
    { title: "Updated title" },
    "application/json",
    new Uint8Array(),
    [],
    [],
  );

const lessonOfOtherTeacher = (deletedAt: Date | null): SessionTaskRow => ({
  taskId,
  deletedAt,
  session: {
    deletedAt: null,
    class: { teacherId: otherTeacherId, deletedAt: null },
    hasAnonymousStudents: false,
    hasClassStudents: true,
  },
});

describe("TasksService.update — task removed from another teacher's lesson", () => {
  it("allows updating a public task whose association was removed", async () => {
    // the task was added to another teacher's lesson and then removed again,
    // which soft-deleted the association
    const service = buildService(
      [lessonOfOtherTeacher(new Date())],
      /* isPublic */ true,
    );

    await expect(update(service)).resolves.toEqual({ id: taskId });
  });

  it("still refuses a public task that is in another teacher's lesson", async () => {
    const service = buildService(
      [lessonOfOtherTeacher(null)],
      /* isPublic */ true,
    );

    await expect(update(service)).rejects.toBeInstanceOf(
      TaskInOtherUsersLessonError,
    );
  });

  it("allows updating a private task whose association was removed", async () => {
    // the same stale association must not trip the "lesson with students" check
    const service = buildService(
      [lessonOfOtherTeacher(new Date())],
      /* isPublic */ false,
    );

    await expect(update(service)).resolves.toEqual({ id: taskId });
  });

  it("still refuses a task in a live lesson that has students", async () => {
    const service = buildService(
      [lessonOfOtherTeacher(null)],
      /* isPublic */ false,
    );

    await expect(update(service)).rejects.toBeInstanceOf(
      TaskInUseByClassOrLessonWithStudentsError,
    );
  });
});
