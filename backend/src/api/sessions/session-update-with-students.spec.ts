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
  const classId = 1;
  const updatedSession = { id: sessionId, tasks: [] };
  const compactInclude = {
    tasks: {
      where: { deletedAt: null },
      orderBy: { index: "asc" },
      select: { taskId: true, index: true },
    },
  };

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
        update: jest.fn().mockResolvedValue(updatedSession),
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
  ): Promise<unknown> => service.update(sessionId, session, taskIds, classId);

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
      ).rejects.toThrow(
        new ConflictException(
          "Cannot remove tasks (ids: 20) from lesson (id: 1) because students already joined it",
        ),
      );

      expect(tx.session.findUniqueOrThrow).toHaveBeenCalledWith({
        where: {
          classId,
          id: sessionId,
          deletedAt: null,
          status: "CREATED",
        },
        include: {
          tasks: {
            where: { deletedAt: null },
            select: { taskId: true },
          },
        },
      });
      expect(tx.session.findFirst).toHaveBeenCalledWith({
        where: {
          id: sessionId,
          deletedAt: null,
          OR: [
            {
              anonymousStudents: {
                some: { deletedAt: null },
              },
            },
            {
              class: {
                students: {
                  some: { deletedAt: null },
                },
              },
            },
          ],
        },
      });

      // the update must be refused, not partially applied
      expect(tx.session.update).not.toHaveBeenCalled();
      expect(tx.sessionTask.deleteMany).not.toHaveBeenCalled();
      expect(tx.sessionTask.upsert).not.toHaveBeenCalled();
    });

    it("rejects making the lesson non-anonymous", async () => {
      const { service, tx } = buildService({
        existingTaskIds: [10, 20],
        existingIsAnonymous: true,
        hasStudents: true,
      });

      await expect(
        update(service, { isAnonymous: false }, [10, 20]),
      ).rejects.toThrow(
        new ConflictException(
          "Cannot change the sharing type of lesson (id: 1) because students already joined it",
        ),
      );

      expect(tx.session.update).not.toHaveBeenCalled();
      expect(tx.sessionTask.deleteMany).not.toHaveBeenCalled();
      expect(tx.sessionTask.upsert).not.toHaveBeenCalled();
    });

    it("rejects making a non-anonymous lesson anonymous", async () => {
      const { service, tx } = buildService({
        existingTaskIds: [10, 20],
        existingIsAnonymous: false,
        hasStudents: true,
      });

      await expect(
        update(service, { isAnonymous: true }, [10, 20]),
      ).rejects.toThrow(
        new ConflictException(
          "Cannot change the sharing type of lesson (id: 1) because students already joined it",
        ),
      );

      expect(tx.session.update).not.toHaveBeenCalled();
      expect(tx.sessionTask.deleteMany).not.toHaveBeenCalled();
      expect(tx.sessionTask.upsert).not.toHaveBeenCalled();
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
      ).resolves.toEqual(updatedSession);

      expect(tx.session.update).toHaveBeenCalledTimes(1);
      expect(tx.session.update).toHaveBeenCalledWith({
        data: { title: "renamed", isAnonymous: true },
        where: { classId, id: sessionId },
        include: compactInclude,
      });
      expect(tx.sessionTask.deleteMany).toHaveBeenCalledWith({
        where: {
          taskId: { notIn: [10, 20] },
          sessionId,
        },
      });
      expect(tx.sessionTask.upsert).toHaveBeenCalledTimes(2);
    });

    it("allows adding a task", async () => {
      const { service, tx } = buildService({
        existingTaskIds: [10, 20],
        existingIsAnonymous: true,
        hasStudents: true,
      });

      await expect(
        update(service, { isAnonymous: true }, [10, 20, 30]),
      ).resolves.toEqual(updatedSession);

      expect(tx.session.update).toHaveBeenCalledTimes(1);
      expect(tx.sessionTask.upsert).toHaveBeenCalledTimes(3);
      expect(tx.sessionTask.upsert).toHaveBeenNthCalledWith(3, {
        where: {
          sessionId_taskId: { sessionId, taskId: 30 },
        },
        update: { index: 2, deletedAt: null },
        create: { taskId: 30, index: 2, sessionId },
      });
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
      ).resolves.toEqual(updatedSession);

      expect(tx.session.update).toHaveBeenCalledTimes(1);
      expect(tx.session.update).toHaveBeenCalledWith({
        data: { isAnonymous: false },
        where: { classId, id: sessionId },
        include: compactInclude,
      });
      expect(tx.sessionTask.deleteMany).toHaveBeenCalledWith({
        where: {
          taskId: { notIn: [10] },
          sessionId,
        },
      });
      expect(tx.sessionTask.upsert).toHaveBeenCalledTimes(1);
      expect(tx.sessionTask.upsert).toHaveBeenCalledWith({
        where: {
          sessionId_taskId: { sessionId, taskId: 10 },
        },
        update: { index: 0, deletedAt: null },
        create: { taskId: 10, index: 0, sessionId },
      });
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
