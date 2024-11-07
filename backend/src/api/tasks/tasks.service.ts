import { Injectable } from "@nestjs/common";
import { Task, Prisma, User } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import { TaskId } from "./dto";

export type TaskCreateInput = Omit<Prisma.TaskCreateInput, "data" | "mimeType">;
export type TaskUpdateInput = Omit<Prisma.TaskUpdateInput, "data" | "mimeType">;
export type TaskWithoutData = Omit<Task, "data">;
export type TaskDataOnly = Pick<Task, "data" | "mimeType">;

const omitData = { data: true };

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  findByIdOrThrow(id: TaskId): Promise<TaskWithoutData> {
    return this.prisma.task.findUniqueOrThrow({
      omit: omitData,
      where: { id },
    });
  }

  downloadByIdOrThrow(id: TaskId): Promise<TaskDataOnly> {
    return this.prisma.task.findUniqueOrThrow({
      select: { data: true, mimeType: true },
      where: { id },
    });
  }

  findMany(args?: Prisma.TaskFindManyArgs): Promise<TaskWithoutData[]> {
    return this.prisma.task.findMany({
      ...args,
      omit: omitData,
    });
  }

  create(
    task: TaskCreateInput,
    mimeType: string,
    data: Buffer,
  ): Promise<TaskWithoutData> {
    const checkedTask: Prisma.TaskCreateInput = {
      ...task,
      mimeType,
      data,
    };
    return this.prisma.task.create({
      data: checkedTask,
      omit: omitData,
    });
  }

  update(id: TaskId, task: TaskUpdateInput): Promise<Task> {
    return this.prisma.task.update({
      data: task,
      where: { id },
      omit: omitData,
    });
  }

  updateFile(
    id: TaskId,
    mimeType: string,
    data: Buffer,
  ): Promise<TaskWithoutData> {
    return this.prisma.task.update({
      data: { mimeType, data },
      where: { id },
      omit: omitData,
    });
  }

  deleteById(id: TaskId): Promise<TaskWithoutData> {
    return this.prisma.task.delete({
      where: { id },
      omit: omitData,
    });
  }
}
