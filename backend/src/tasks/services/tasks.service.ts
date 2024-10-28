import { Injectable } from "@nestjs/common";
import { Prisma, Task } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateTaskDto } from "../dto/create-task.dto";
import { UpdateTaskDto } from "../dto/update-task.dto";
import { TaskWithoutData } from "../entities/task-info.entity";

// default omit for task data, which is heavy
const omit = { rawData: true };

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async findUniqueInfo(
    where: Prisma.TaskWhereUniqueInput,
  ): Promise<TaskWithoutData | null> {
    return this.prisma.task.findUnique({ omit, where });
  }

  async findUniqueData(
    where: Prisma.TaskWhereUniqueInput,
  ): Promise<Buffer | null> {
    const task = await this.prisma.task.findUnique({
      where,
      select: { rawData: true },
    });

    return task?.rawData ?? null;
  }

  async findManyInfo({
    skip,
    take,
    cursor,
    where,
    orderBy,
    include,
  }: {
    skip?: number;
    take?: number;
    cursor?: Prisma.TaskWhereUniqueInput;
    where?: Prisma.TaskWhereInput;
    orderBy?: Prisma.TaskOrderByWithRelationInput;
    include?: Prisma.TaskInclude;
  }): Promise<TaskWithoutData[]> {
    return this.prisma.task.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      include,
      omit,
    });
  }

  async create(data: CreateTaskDto): Promise<TaskWithoutData> {
    return this.prisma.task.create({
      data: data.toInput(),
      omit, // TODO: check if this works for creation
    });
  }

  async update({
    data,
    where,
  }: {
    where: Prisma.TaskWhereUniqueInput;
    data: UpdateTaskDto;
  }): Promise<TaskWithoutData> {
    return this.prisma.task.update({
      data: data.toInput(),
      where,
      omit, // TODO: check if this works for creation
    });
  }

  async delete(where: Prisma.TaskWhereUniqueInput): Promise<TaskWithoutData> {
    return this.prisma.task.delete({ where, omit });
  }
}
