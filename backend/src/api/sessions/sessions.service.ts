import { Injectable } from "@nestjs/common";
import { Session, Prisma } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import { SessionId } from "./dto";

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
    const [_, update] = await this.prisma.$transaction([
      // we could do `deleteMany` and `createMany` within the same update(),
      // however we need a transaction because of this open bug:
      // https://github.com/prisma/prisma/issues/16606
      this.prisma.sessionTask.deleteMany({
        where: { sessionId: id },
      }),
      this.prisma.session.update({
        data: {
          ...session,
          tasks: {
            createMany: {
              data: taskIds.map((taskId, index) => ({ taskId, index })),
            },
          },
        },
        where: { classId, id },
        include: compactInclude,
      }),
    ]);
    return update;
  }

  deletedByIdAndClass(id: SessionId, classId?: number): Promise<Session> {
    return this.prisma.session.delete({
      where: { classId, id },
      include: compactInclude,
    });
  }

  deleteById(id: SessionId): Promise<Session> {
    return this.deletedByIdAndClass(id);
  }
}
