import { Prisma } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import { SessionsService } from "../sessions.service";

// An anonymous lesson never admits the class's enrolled students - it creates
// ad-hoc anonymous identities instead. So whether it is locked for editing may
// only depend on its own anonymous participants; the class roster is
// irrelevant to it (CRT-439). Because Class.students is the class-wide roster
// and not scoped to a session, an unconditional OR over it locks every
// anonymous lesson in any class that ever enrolled a student.
//
// These drive the service against a mocked Prisma whose session.findFirst
// evaluates the where-clause it is given against a fixture, rather than
// asserting a literal clause: a query that checks the roster for an anonymous
// lesson really does match here, exactly as it would against Postgres.

const sessionId = 1;
const classId = 1;

type SessionFixture = {
  isAnonymous: boolean;
  anonymousStudentCount: number;
  classStudentCount: number;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Where = any;

/**
 * Minimal stand-in for Prisma's filtering, supporting exactly the fields the
 * has-students query uses. A branch that does not constrain isAnonymous
 * applies to every lesson - the behaviour under test.
 */
const sessionMatches = (fixture: SessionFixture, where: Where): boolean => {
  if (where.id !== undefined && where.id !== sessionId) {
    return false;
  }

  if (!Array.isArray(where.OR)) {
    return true;
  }

  return where.OR.some((branch: Where) => {
    if (
      branch.isAnonymous !== undefined &&
      branch.isAnonymous !== fixture.isAnonymous
    ) {
      return false;
    }

    if (branch.anonymousStudents) {
      return fixture.anonymousStudentCount > 0;
    }

    if (branch.class?.students) {
      return fixture.classStudentCount > 0;
    }

    return false;
  });
};

const buildService = (
  fixture: SessionFixture,
  existingTaskIds: number[] = [],
): { service: SessionsService; tx: MockTx } => {
  const findFirst = jest.fn(({ where }: { where: Where }) =>
    Promise.resolve(sessionMatches(fixture, where) ? { id: sessionId } : null),
  );

  const tx = {
    session: {
      findUniqueOrThrow: jest.fn().mockResolvedValue({
        isAnonymous: fixture.isAnonymous,
        tasks: existingTaskIds.map((taskId) => ({ taskId })),
      }),
      findFirst,
      update: jest.fn().mockResolvedValue({ id: sessionId, tasks: [] }),
    },
    sessionTask: {
      deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
      upsert: jest.fn().mockResolvedValue({}),
    },
  };

  const prisma = {
    ...tx,
    $transaction: jest.fn((callback: (client: MockTx) => Promise<unknown>) =>
      callback(tx),
    ),
  } as unknown as PrismaService;

  return { service: new SessionsService(prisma), tx };
};

const update = (
  service: SessionsService,
  session: Prisma.SessionUpdateInput,
  taskIds: number[],
): Promise<unknown> => service.update(sessionId, session, taskIds, classId);

describe("SessionsService — anonymous lessons ignore the class roster", () => {
  describe("hasStudents", () => {
    it("is false for an anonymous lesson nobody joined, even with a full class", () => {
      const { service } = buildService({
        isAnonymous: true,
        anonymousStudentCount: 0,
        classStudentCount: 5,
      });

      return expect(service.hasStudents(sessionId)).resolves.toBe(false);
    });

    it("is true for an anonymous lesson with anonymous participants", () => {
      const { service } = buildService({
        isAnonymous: true,
        anonymousStudentCount: 2,
        classStudentCount: 0,
      });

      return expect(service.hasStudents(sessionId)).resolves.toBe(true);
    });

    it("is true for a regular lesson whose class has students", () => {
      const { service } = buildService({
        isAnonymous: false,
        anonymousStudentCount: 0,
        classStudentCount: 5,
      });

      return expect(service.hasStudents(sessionId)).resolves.toBe(true);
    });

    it("is false for a regular lesson whose class is empty", () => {
      const { service } = buildService({
        isAnonymous: false,
        anonymousStudentCount: 0,
        classStudentCount: 0,
      });

      return expect(service.hasStudents(sessionId)).resolves.toBe(false);
    });
  });

  describe("update", () => {
    it("lets the teacher remove a task from an unjoined anonymous lesson", async () => {
      const { service, tx } = buildService(
        { isAnonymous: true, anonymousStudentCount: 0, classStudentCount: 5 },
        [10, 20],
      );

      // drop task 20
      await expect(
        update(service, { isAnonymous: true }, [10]),
      ).resolves.toEqual({ id: sessionId, tasks: [] });

      expect(tx.session.update).toHaveBeenCalled();
    });

    it("lets the teacher change the sharing type of an unjoined anonymous lesson", async () => {
      const { service, tx } = buildService(
        { isAnonymous: true, anonymousStudentCount: 0, classStudentCount: 5 },
        [10],
      );

      await expect(
        update(service, { isAnonymous: false }, [10]),
      ).resolves.toEqual({ id: sessionId, tasks: [] });

      expect(tx.session.update).toHaveBeenCalled();
    });

    it("still refuses to remove a task once anonymous students joined", async () => {
      const { service } = buildService(
        { isAnonymous: true, anonymousStudentCount: 3, classStudentCount: 0 },
        [10, 20],
      );

      await expect(
        update(service, { isAnonymous: true }, [10]),
      ).rejects.toThrow(
        "Cannot remove tasks (ids: 20) from lesson (id: 1) because students already joined it",
      );
    });

    it("still refuses to remove a task from a regular lesson with students", async () => {
      const { service } = buildService(
        { isAnonymous: false, anonymousStudentCount: 0, classStudentCount: 5 },
        [10, 20],
      );

      await expect(
        update(service, { isAnonymous: false }, [10]),
      ).rejects.toThrow(
        "Cannot remove tasks (ids: 20) from lesson (id: 1) because students already joined it",
      );
    });
  });
});

type MockTx = {
  session: {
    findUniqueOrThrow: jest.Mock;
    findFirst: jest.Mock;
    update: jest.Mock;
  };
  sessionTask: { deleteMany: jest.Mock; upsert: jest.Mock };
};
