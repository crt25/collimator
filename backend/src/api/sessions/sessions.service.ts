import { Injectable } from "@nestjs/common";
import { Session, Prisma } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import { SessionStatus } from ".prisma/client";
import { getCurrentStudentSolutions } from "@prisma/client/sql";
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
  class: { select: { id: true, name: true } },
  lesson: { select: { id: true, title: true } },
};

interface StudentTaskProgress {
  id: number;
  taskProgress: TaskProgress;
}

@Injectable()
export class SessionsService {
  constructor(private readonly prisma: PrismaService) {}

  findByIdOrThrow(id: SessionId): Promise<Session> {
    return this.findByIdAndClassOrThrow(id);
  }

  findByIdAndClassOrThrow(id: SessionId, classId?: number): Promise<Session> {
    return this.prisma.session.findUniqueOrThrow({
      where: { classId, id },
      include: fullInclude,
    });
  }

  findMany(args?: Prisma.SessionFindManyArgs): Promise<Session[]> {
    return this.prisma.session.findMany({
      ...args,
      include: compactInclude,
    });
  }

  create(
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

    return this.prisma.session.create({
      data: checkedSession,
      include: compactInclude,
    });
  }

  async update(
    id: SessionId,
    session: Prisma.SessionUpdateInput,
    taskIds: number[],
    classId?: number,
  ): Promise<Session> {
    const [_find, _del, update] = await this.prisma.$transaction([
      // ensure the session exists and hasn't started yet
      this.prisma.session.findUniqueOrThrow({
        where: { classId, id, status: "CREATED" },
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
    return update;
  }

  changeStatusByIdAndClass(
    id: SessionId,
    status: SessionStatus,
    classId?: number,
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

    return this.prisma.session.update({
      data: { status: status },
      where: {
        id,
        classId,
        OR: allowedStates.map((s) => ({ status: s })),
      },
      include: compactInclude,
    });
  }

  deletedByIdAndClass(id: SessionId, classId?: number): Promise<Session> {
    return this.prisma.session.delete({
      where: { classId, id, status: "CREATED" },
      include: compactInclude,
    });
  }

  deleteById(id: SessionId): Promise<Session> {
    return this.deletedByIdAndClass(id);
  }

  async getSessionProgress(
    id: SessionId,
    studentId: number,
  ): Promise<StudentTaskProgress[]> {
    const solutions = await this.prisma.$queryRawTyped(
      getCurrentStudentSolutions(id, studentId),
    );

    return solutions
      .map((s) => ({
        solutionId: s.solutionId,
        taskId: s.taskId,
        passedTests: s.passedTests ?? 0,
        totalTests: s.totalTests ?? 0,
      }))
      .map<StudentTaskProgress>((solution) => {
        let taskProgress = TaskProgress.unOpened;

        if (!isNaN(solution.solutionId) && solution.solutionId > 0) {
          // solutionId, passedTests and totalTests may be null, we are doing a LEFT JOIN
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
