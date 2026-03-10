import { Injectable, Logger } from "@nestjs/common";
import { Session, Prisma } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import { SessionStatus } from ".prisma/client";
import { getCurrentStudentSolutions } from "@prisma/client/sql";
import { PrismaTransactionClient } from "src/prisma/types";
import { ClassId } from "../classes/dto";
import { StudentId } from "../solutions/solutions.service";
import { SessionId } from "./dto";
import { TaskProgress } from "./task-progress";

const compactInclude = {
  tasks: {
    orderBy: { index: "asc" as Prisma.SortOrder },
    select: {
      taskId: true,
      index: true,
    },
  },
  lesson: { select: { id: true, title: true } },
};

const fullInclude = {
  tasks: {
    orderBy: { index: "asc" as Prisma.SortOrder },
    select: {
      index: true,
      task: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  },
  class: { select: { id: true, name: true, deletedAt: true } },
  lesson: { select: { id: true, title: true } },
};

interface StudentTaskProgress {
  id: number;
  taskProgress: TaskProgress;
}

@Injectable()
export class SessionsService {
  private readonly logger = new Logger(SessionsService.name);

  constructor(private readonly prisma: PrismaService) {}

  findByIdOrThrow(id: SessionId): Promise<Session> {
    return this.findByIdAndClassOrThrow(id);
  }

  findByIdAndClassOrThrow(
    id: SessionId,
    classId?: number,
    includeSoftDelete = false,
  ): Promise<Session> {
    return this.prisma.session.findUniqueOrThrow({
      where: includeSoftDelete
        ? { classId, id }
        : { classId, id, deletedAt: null },
      include: fullInclude,
    });
  }

  findMany(
    args?: Prisma.SessionFindManyArgs,
    includeSoftDelete = false,
  ): Promise<Session[]> {
    const initialWhere = args?.where ?? {};

    const whereClause = includeSoftDelete
      ? initialWhere
      : { ...initialWhere, deletedAt: null };

    // construct args separately to avoid typescript deep type comparison issues
    const finalArgs = {
      ...args,
      include: compactInclude,
      where: whereClause,
    };

    return this.prisma.session.findMany(finalArgs);
  }

  async create(
    classId: number,
    session: Omit<Prisma.SessionUncheckedCreateInput, "classId">,
    taskIds: number[],
  ): Promise<Session> {
    const checkedSession: Prisma.SessionCreateInput = {
      ...session,
      class: {
        connect: { id: classId },
      },
      tasks: {
        createMany: {
          data: taskIds.map((taskId, index) => ({ taskId, index })),
        },
      },
    };

    const created = await this.prisma.session.create({
      data: checkedSession,
      include: compactInclude,
    });

    this.logger.log(
      `Created lesson (id: ${created.id}) for class (id: ${classId}) with ${taskIds.length} tasks`,
    );
    return created;
  }

  async update(
    id: SessionId,
    session: Prisma.SessionUpdateInput,
    taskIds: number[],
    classId?: number,
    includeSoftDelete = false,
  ): Promise<Session> {
    const [_find, _del, update] = await this.prisma.$transaction([
      // ensure the session exists and hasn't started yet
      this.prisma.session.findUniqueOrThrow({
        where: includeSoftDelete
          ? { classId, id, status: "CREATED" }
          : { classId, id, deletedAt: null, status: "CREATED" },
      }),
      // we could do `deleteMany` and `createMany` within the same update(),
      // however we need a transaction because of this open bug:
      // https://github.com/prisma/prisma/issues/16606
      this.prisma.sessionTask.deleteMany({
        where: {
          taskId: {
            notIn: taskIds,
          },
          sessionId: id,
        },
      }),
      this.prisma.session.update({
        data: session,
        where: { classId, id },
        include: compactInclude,
      }),
      ...taskIds.map((taskId, index) =>
        this.prisma.sessionTask.upsert({
          where: {
            sessionId_taskId: {
              sessionId: id,
              taskId,
            },
          },
          update: { index },
          create: {
            taskId,
            index,
            sessionId: id,
          },
        }),
      ),
    ]);

    this.logger.log(`Updated lesson (id: ${id}) with ${taskIds.length} tasks`);
    return update;
  }

  async hasStudents(
    sessionId: SessionId,
    includeSoftDelete = false,
  ): Promise<boolean> {
    return this.hasStudentsTx(this.prisma, sessionId, includeSoftDelete);
  }

  private async hasStudentsTx(
    tx: PrismaTransactionClient,
    sessionId: SessionId,
    includeSoftDelete = false,
  ): Promise<boolean> {
    const sessionWithStudents = await tx.session.findFirst({
      where: {
        id: sessionId,
        deletedAt: includeSoftDelete ? undefined : null,
        OR: [
          {
            anonymousStudents: {
              some: {
                deletedAt: includeSoftDelete ? undefined : null,
              },
            },
          },
          {
            class: {
              students: {
                some: {
                  deletedAt: includeSoftDelete ? undefined : null,
                },
              },
            },
          },
        ],
      },
    });

    return sessionWithStudents !== null;
  }

  async changeStatusByIdAndClass(
    id: SessionId,
    status: SessionStatus,
    classId?: number,
    includeSoftDelete = false,
  ): Promise<Session> {
    let allowedStates: SessionStatus[] = [];
    switch (status) {
      case "ONGOING":
        allowedStates = ["CREATED", "ONGOING", "PAUSED"];
        break;
      case "PAUSED":
        allowedStates = ["ONGOING", "PAUSED"];
        break;
      case "FINISHED":
        allowedStates = ["ONGOING", "PAUSED", "FINISHED"];
        break;
    }

    const where = includeSoftDelete
      ? { classId, id, OR: allowedStates.map((s) => ({ status: s })) }
      : {
          classId,
          id,
          deletedAt: null,
          OR: allowedStates.map((s) => ({ status: s })),
        };

    const updated = await this.prisma.session.update({
      data: { status: status },
      where,
      include: compactInclude,
    });

    this.logger.log(`Lesson (id: ${id}) status changed to ${status}`);
    return updated;
  }

  async deletedByIdAndClass(
    id: SessionId,
    classId?: ClassId,
  ): Promise<Session> {
    const deleted = await this.prisma.session.delete({
      where: { classId, id, status: "CREATED" },
      include: compactInclude,
    });
    this.logger.log(`Deleted lesson (id: ${id})`);
    return deleted;
  }

  deleteById(id: SessionId): Promise<Session> {
    return this.deletedByIdAndClass(id);
  }

  async copy(
    sourceSessionId: SessionId,
    targetClassId: number,
    includeSoftDelete = false,
  ): Promise<Session> {
    return this.prisma.$transaction(async (tx) => {
      const sourceSession = await tx.session.findUniqueOrThrow({
        where: includeSoftDelete
          ? { id: sourceSessionId }
          : { id: sourceSessionId, deletedAt: null },
        include: {
          tasks: {
            orderBy: { index: "asc" },
            select: {
              taskId: true,
              index: true,
            },
          },
        },
      });

      const taskIds = sourceSession.tasks.map((t) => t.taskId);

      const checkedSession: Prisma.SessionCreateInput = {
        title: sourceSession.title,
        description: sourceSession.description,
        isAnonymous: sourceSession.isAnonymous,
        class: {
          connect: { id: targetClassId },
        },
        tasks: {
          createMany: {
            data: taskIds.map((taskId, index) => ({ taskId, index })),
          },
        },
      };

      const copied = await tx.session.create({
        data: checkedSession,
        include: compactInclude,
      });

      this.logger.log(
        `Copied lesson (id: ${sourceSessionId}) to new lesson (id: ${copied.id}) in class (id: ${targetClassId})`,
      );
      return copied;
    });
  }

  async getSessionProgress(
    id: SessionId,
    studentId: StudentId,
  ): Promise<StudentTaskProgress[]> {
    const solutions = await this.prisma.$queryRawTyped(
      getCurrentStudentSolutions(id, studentId),
    );

    return solutions
      .map((s) => ({
        studentSolutionId: s.studentSolutionId,
        taskId: s.taskId,
        passedTests: s.passedTests ?? 0,
        totalTests: s.totalTests ?? 0,
      }))
      .map<StudentTaskProgress>((solution) => {
        let taskProgress = TaskProgress.unOpened;

        if (
          !isNaN(solution.studentSolutionId) &&
          solution.studentSolutionId > 0
        ) {
          // studentSolutionId may be null, we are doing a LEFT JOIN.
          // If so, no solution has been submitted yet.

          if (solution.passedTests >= solution.totalTests) {
            taskProgress = TaskProgress.done;
          } else if (solution.passedTests > 0) {
            taskProgress = TaskProgress.partiallyDone;
          } else {
            taskProgress = TaskProgress.opened;
          }
        }

        return {
          id: solution.taskId,
          taskProgress,
        };
      });
  }
}
