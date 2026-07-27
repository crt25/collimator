import { ConflictException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import { SessionsService } from "./sessions.service";

// Once students have joined a lesson, removing its tasks or changing its
// sharing type takes the lesson away from them (nothing left to solve, or an
// anonymous lesson that stops admitting anonymous students). SessionsService
// .update must reject both while still allowing harmless edits. The rule lives
// in the interactive transaction, so these drive update() with a mocked Prisma:
// $transaction runs the callback against a mock tx, session.findFirst stands in
// for "does the lesson have students", and session.findUniqueOrThrow for the
// lesson's current tasks and sharing type.
describe("SessionsService.update — students already joined", () => {
  const sessionId = 1;

  const buildService = (opts: {
    existingTaskIds: number[];
    existingIsAnonymous: boolean;
    hasStudents: boolean;
  }): { service: SessionsService; tx: MockTx } => {
    const tx = {
      session: {
        findUniqueOrThrow: jest.fn().mockResolvedValue({
          isAnonymous: opts.existingIsAnonymous,
          tasks: opts.existingTaskIds.map((taskId) => ({ taskId })),
        }),
        // hasStudentsTx() resolves to a row iff the lesson has students
        findFirst: jest
          .fn()
          .mockResolvedValue(opts.hasStudents ? { id: sessionId } : null),
        update: jest
          .fn()
          .mockResolvedValue({ id: sessionId, tasks: [], lesson: null }),
      },
      sessionTask: {
        deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
        upsert: jest.fn().mockResolvedValue({}),
      },
    };

    const prisma = {
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
  ): Promise<unknown> => service.update(sessionId, session, taskIds, 1);

  describe("with students in the lesson", () => {
    it("rejects removing a task", async () => {
      const { service, tx } = buildService({
        existingTaskIds: [10, 20],
        existingIsAnonymous: true,
        hasStudents: true,
      });

      // drop task 20
      await expect(
        update(service, { isAnonymous: true }, [10]),
      ).rejects.toThrow(ConflictException);

      // the update must be refused, not partially applied
      expect(tx.session.update).not.toHaveBeenCalled();
      expect(tx.sessionTask.deleteMany).not.toHaveBeenCalled();
    });

    it("rejects making the lesson non-anonymous", async () => {
      const { service, tx } = buildService({
        existingTaskIds: [10, 20],
        existingIsAnonymous: true,
        hasStudents: true,
      });

      await expect(
        update(service, { isAnonymous: false }, [10, 20]),
      ).rejects.toThrow(ConflictException);

      expect(tx.session.update).not.toHaveBeenCalled();
    });

    // positive controls: a fix that refused every update of a lesson with
    // students would satisfy the rejections above without being correct
    it("allows renaming without touching tasks or sharing type", async () => {
      const { service, tx } = buildService({
        existingTaskIds: [10, 20],
        existingIsAnonymous: true,
        hasStudents: true,
      });

      await expect(
        update(service, { title: "renamed", isAnonymous: true }, [10, 20]),
      ).resolves.toBeDefined();

      expect(tx.session.update).toHaveBeenCalledTimes(1);
    });

    it("allows adding a task", async () => {
      const { service, tx } = buildService({
        existingTaskIds: [10, 20],
        existingIsAnonymous: true,
        hasStudents: true,
      });

      await expect(
        update(service, { isAnonymous: true }, [10, 20, 30]),
      ).resolves.toBeDefined();

      expect(tx.session.update).toHaveBeenCalledTimes(1);
    });
  });

  describe("with no students in the lesson", () => {
    it("allows removing a task and changing the sharing type", async () => {
      const { service, tx } = buildService({
        existingTaskIds: [10, 20],
        existingIsAnonymous: true,
        hasStudents: false,
      });

      await expect(
        update(service, { isAnonymous: false }, [10]),
      ).resolves.toBeDefined();

      expect(tx.session.update).toHaveBeenCalledTimes(1);
    });
  });
});

type MockTx = {
  session: {
    findUniqueOrThrow: jest.Mock;
    findFirst: jest.Mock;
    update: jest.Mock;
  };
  sessionTask: {
    deleteMany: jest.Mock;
    upsert: jest.Mock;
  };
};
