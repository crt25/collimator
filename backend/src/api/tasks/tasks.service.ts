import { createHash } from "crypto";
import { Injectable } from "@nestjs/common";
import {
  Task,
  Prisma,
  Solution,
  ReferenceSolution,
  SolutionTest,
} from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import { Modify } from "src/utilities/modify";
import { ReferenceSolutionId } from "../solutions/dto/existing-reference-solution.dto";
import { TaskId } from "./dto";

export class TaskInUseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TaskInUseError";
  }
}

export type TaskCreateInput = Omit<
  Prisma.TaskUncheckedCreateInput,
  "data" | "mimeType"
>;

export type SolutionTestInput = Prisma.SolutionTestUncheckedCreateInput;

export type ReferenceSolutionInput = Omit<
  Modify<
    Prisma.ReferenceSolutionUncheckedCreateInput,
    {
      id?: ReferenceSolutionId | null;
    }
  >,
  "taskId" | "solutionHash"
> & {
  tests: SolutionTestInput[];
};

export type TaskUpdateInput = Omit<Prisma.TaskUpdateInput, "data" | "mimeType">;
export type TaskWithoutData = Omit<Task, "data">;
export type TaskWithReferenceSolutions = Omit<Task, "data"> & {
  referenceSolutions: (Omit<ReferenceSolution, "taskId" | "solutionHash"> & {
    solution: Omit<Solution, "taskId" | "hash" | "failedAnalyses">;
    tests: SolutionTest[];
  })[];
};
export type TaskDataOnly = Pick<Task, "data" | "mimeType">;

const omitData = { data: true };

// When using Prisma extensions with client.$extends(), the transaction callback
// receives a client type that excludes certain top-level methods like $use, $transaction, etc.
// This type matches both the extended PrismaService and transaction clients by only
// requiring the model access methods we actually need, and not the full TransactionClient interface.
type PrismaTransactionClient = Omit<
  PrismaService,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$extends"
>;

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  computeSolutionHash(data: Solution["data"]): Buffer {
    return createHash("sha256").update(data).digest();
  }

  findByIdOrThrow(
    id: TaskId,
    includeSoftDelete = false,
  ): Promise<TaskWithoutData> {
    return this.prisma.task.findUniqueOrThrow({
      omit: omitData,
      where: includeSoftDelete ? { id } : { id, deletedAt: null },
    });
  }

  findByIdOrThrowWithReferenceSolutions(
    id: TaskId,
    includeSoftDelete = false,
  ): Promise<TaskWithReferenceSolutions> {
    return this.prisma.task.findUniqueOrThrow({
      where: includeSoftDelete ? { id } : { id, deletedAt: null },
      include: {
        referenceSolutions: {
          where: includeSoftDelete ? undefined : { deletedAt: null },
          include: {
            solution: {
              select: {
                data: true,
                mimeType: true,
                deletedAt: true,
              },
            },
            tests: {
              where: includeSoftDelete ? undefined : { deletedAt: null },
            },
          },
        },
      },
    });
  }

  downloadByIdOrThrow(
    id: TaskId,
    includeSoftDelete = false,
  ): Promise<TaskDataOnly> {
    return this.prisma.task.findUniqueOrThrow({
      select: { data: true, mimeType: true },
      where: includeSoftDelete ? { id } : { id, deletedAt: null },
    });
  }

  findMany(
    args?: Prisma.TaskFindManyArgs,
    includeSoftDelete = false,
  ): Promise<TaskWithoutData[]> {
    const where = includeSoftDelete
      ? args?.where
      : { ...args?.where, deletedAt: null };

    // construct args separately to avoid typescript deep type comparison issues
    const finalArgs: Prisma.TaskFindManyArgs = {
      ...args,
      where,
      omit: omitData,
    };

    return this.prisma.task.findMany(finalArgs);
  }

  async create(
    task: TaskCreateInput,
    mimeType: string,
    data: Uint8Array,
    referenceSolutions: ReferenceSolutionInput[],
    referenceSolutionFiles: Express.Multer.File[],
  ): Promise<TaskWithoutData> {
    return this.prisma.$transaction(async (tx) => {
      const createdTask = await tx.task.create({
        data: {
          ...task,
          mimeType,
          data,
          referenceSolutions: {
            create: [],
          },
        },
        select: { id: true },
      });

      return tx.task.update({
        where: { id: createdTask.id },
        data: {
          referenceSolutions: {
            create: referenceSolutions.map((solution, index) => {
              const file = referenceSolutionFiles[index];

              const fileHash = this.computeSolutionHash(file.buffer);

              return {
                title: solution.title,
                description: solution.description,
                isInitial: solution.isInitial,
                tests: {
                  create: solution.tests,
                },
                solution: {
                  create: {
                    taskId: createdTask.id,
                    data: file.buffer,
                    mimeType: file.mimetype,
                    hash: fileHash,
                  },
                },
              };
            }),
          },
        },
        omit: omitData,
      });
    });
  }

  async update(
    id: TaskId,
    task: TaskUpdateInput,
    mimeType: string,
    data: Uint8Array,
    referenceSolutions: ReferenceSolutionInput[],
    referenceSolutionFiles: Express.Multer.File[],
    includeSoftDelete = false,
  ): Promise<Task> {
    const solutionsWithFile = referenceSolutions.map(
      (referenceSolution, index) => ({
        solution: referenceSolution,
        file: referenceSolutionFiles[index],
        fileHash: this.computeSolutionHash(
          referenceSolutionFiles[index].buffer,
        ),
      }),
    );

    const newReferenceSolutions = solutionsWithFile.filter(
      (
        referenceSolution,
      ): referenceSolution is {
        solution: ReferenceSolutionInput & { id: undefined };
        file: Express.Multer.File;
        fileHash: Buffer;
      } =>
        referenceSolution.solution.id === undefined ||
        referenceSolution.solution.id === null,
    );

    const updatedReferenceSolutions = solutionsWithFile.filter(
      (
        referenceSolution,
      ): referenceSolution is {
        solution: ReferenceSolutionInput & { id: ReferenceSolutionId };
        file: Express.Multer.File;
        fileHash: Buffer;
      } =>
        referenceSolution.solution.id !== undefined &&
        referenceSolution.solution.id !== null,
    );

    const referenceSolutionWhere = includeSoftDelete
      ? {
          taskId: id,
          id: {
            notIn: referenceSolutions
              .map(({ id }) => id)
              .filter((id) => id !== undefined && id !== null),
          },
        }
      : {
          taskId: id,
          deletedAt: null,
          id: {
            notIn: referenceSolutions
              .map(({ id }) => id)
              .filter((id) => id !== undefined && id !== null),
          },
        };

    const orphanedSolutionsWhere = includeSoftDelete
      ? {
          referenceSolutions: { none: {} },
          studentSolutions: { none: {} },
        }
      : {
          deletedAt: null,
          referenceSolutions: { none: {} },
          studentSolutions: { none: {} },
        };

    return this.prisma.$transaction(async (tx) => {
      const isInUse = await this.isTaskInUseTx(tx, id);
      if (isInUse) {
        throw new TaskInUseError(
          "Task is in use by one or more classes and cannot be modified",
        );
      }

      // delete all reference solutions that are not in the new list
      await tx.referenceSolution.deleteMany({
        where: referenceSolutionWhere,
      });

      // delete all solutions without any reference
      await tx.solution.deleteMany({
        where: orphanedSolutionsWhere,
      });

      // update the task
      return tx.task.update({
        data: {
          ...task,
          mimeType,
          data,
          referenceSolutions: {
            create: newReferenceSolutions.map(
              ({ solution, file, fileHash }) => ({
                title: solution.title,
                description: solution.description,
                isInitial: solution.isInitial,
                tests: {
                  connectOrCreate: this.getExistingTests(solution.tests).map(
                    (test) => ({
                      where: { id: test.id },
                      create: test,
                    }),
                  ),
                  create: this.getNewTests(solution.tests),
                },
                solution: {
                  connectOrCreate: {
                    where: {
                      taskId_hash: {
                        hash: fileHash,
                        taskId: id,
                      },
                    },
                    create: {
                      data: file.buffer,
                      mimeType: file.mimetype,
                      hash: fileHash,
                      taskId: id,
                    },
                  },
                },
              }),
            ),
            update: updatedReferenceSolutions.map(
              ({ solution, file, fileHash }) => ({
                where: { id: solution.id },
                data: {
                  title: solution.title,
                  description: solution.description,
                  isInitial: solution.isInitial,
                  tests: {
                    deleteMany: {
                      id: {
                        notIn: this.getExistingTests(solution.tests).map(
                          ({ id }) => id,
                        ),
                      },
                    },
                    update: this.getExistingTests(solution.tests).map(
                      (test) => ({
                        where: {
                          id: test.id,
                        },
                        data: test,
                      }),
                    ),
                    create: this.getNewTests(solution.tests),
                  },
                  solution: {
                    connectOrCreate: {
                      where: {
                        taskId_hash: {
                          hash: fileHash,
                          taskId: id,
                        },
                      },
                      create: {
                        data: file.buffer,
                        mimeType: file.mimetype,
                        hash: fileHash,
                        taskId: id,
                      },
                    },
                  },
                },
              }),
            ),
          },
        },
        where: { id },
        omit: omitData,
      });
    });
  }

  private getNewTests(
    tests: Prisma.SolutionTestUncheckedCreateInput[],
  ): (Prisma.SolutionTestUncheckedCreateInput & { id: undefined })[] {
    return tests.filter(
      (test) => test.id === undefined || test.id === null,
    ) as (Prisma.SolutionTestUncheckedCreateInput & { id: undefined })[];
  }

  private getExistingTests(
    tests: Prisma.SolutionTestUncheckedCreateInput[],
  ): (Prisma.SolutionTestUncheckedCreateInput & { id: number })[] {
    return tests.filter(
      (test) => test.id !== undefined && test.id !== null,
    ) as (Prisma.SolutionTestUncheckedCreateInput & { id: number })[];
  }

  async isTaskInUse(id: TaskId): Promise<boolean> {
    return this.isTaskInUseTx(this.prisma, id);
  }

  private async isTaskInUseTx(
    tx: PrismaTransactionClient,
    id: TaskId,
  ): Promise<boolean> {
    const sessionWithStudents = await tx.sessionTask.findFirst({
      where: {
        taskId: id,
        session: {
          deletedAt: null,
          OR: [
            {
              anonymousStudents: {
                some: {
                  deletedAt: null,
                },
              },
            },
            {
              class: {
                deletedAt: null,
                students: {
                  some: {
                    deletedAt: null,
                  },
                },
              },
            },
          ],
        },
      },
    });

    return sessionWithStudents !== null;
  }

  async deleteById(id: TaskId): Promise<TaskWithoutData> {
    return this.prisma.$transaction(async (tx) => {
      const isInUse = await this.isTaskInUseTx(tx, id);
      if (isInUse) {
        throw new TaskInUseError(
          "Task is in use by one or more classes and cannot be deleted",
        );
      }

      // delete all reference solutions for this task
      await tx.solution.deleteMany({
        where: {
          taskId: id,
          referenceSolutions: {
            some: {
              taskId: id,
            },
          },
        },
      });

      await tx.referenceSolution.deleteMany({
        where: {
          taskId: id,
        },
      });

      // and the task itself
      return tx.task.delete({
        where: { id },
        omit: omitData,
      });
    });
  }
}
