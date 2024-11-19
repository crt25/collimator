import { Injectable } from "@nestjs/common";
import { Solution, Prisma, SolutionAnalysis } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import { getCurrentAnalyses } from "@prisma/client/sql";

import { SolutionId } from "./dto";

export type SolutionCreateInput = Omit<
  Prisma.SolutionUncheckedCreateInput,
  "data" | "mimeType"
>;
export type SolutionUpdateInput = Omit<
  Prisma.SolutionUpdateInput,
  "data" | "mimeType"
>;
export type SolutionWithoutData = Omit<Solution, "data">;
export type SolutionDataOnly = Pick<Solution, "data" | "mimeType">;

export type SolutionAnalysisCreateInput = Omit<
  Prisma.SolutionAnalysisUncheckedCreateInput,
  "id"
>;

const omitData = { data: true };

@Injectable()
export class SolutionsService {
  constructor(private readonly prisma: PrismaService) {}

  findByIdOrThrow(
    sessionId: number,
    taskId: number,
    id: SolutionId,
  ): Promise<SolutionWithoutData> {
    return this.prisma.solution.findUniqueOrThrow({
      omit: omitData,
      where: { id, sessionId, taskId },
    });
  }

  findAllCurrentAnalyses(
    sessionId: number,
    taskId: number,
  ): Promise<SolutionAnalysis[]> {
    return this.prisma.$queryRawTyped(getCurrentAnalyses(sessionId, taskId));
  }

  findAnalysisByIdOrThrow(
    sessionId: number,
    taskId: number,
    id: SolutionId,
  ): Promise<SolutionAnalysis> {
    return this.prisma.solutionAnalysis.findUniqueOrThrow({
      where: { solution: { sessionId, taskId }, solutionId: id },
    });
  }

  downloadByIdOrThrow(
    sessionId: number,
    taskId: number,
    id: SolutionId,
  ): Promise<SolutionDataOnly> {
    return this.prisma.solution.findUniqueOrThrow({
      select: { data: true, mimeType: true },
      where: { id, sessionId, taskId },
    });
  }

  findMany(args?: Prisma.SolutionFindManyArgs): Promise<SolutionWithoutData[]> {
    return this.prisma.solution.findMany({
      ...args,
      omit: omitData,
    });
  }

  create(
    solution: SolutionCreateInput,
    mimeType: string,
    data: Buffer,
  ): Promise<Solution> {
    const { studentId, sessionId, taskId, ...rest } = solution;
    const checkedSolution: Prisma.SolutionCreateInput = {
      ...rest,
      mimeType,
      data,
      student: { connect: { id: studentId } },
      session: { connect: { id: sessionId } },
      task: { connect: { id: taskId } },
      sessionTask: { connect: { sessionId_taskId: { sessionId, taskId } } },
    };

    return this.prisma.solution.create({
      data: checkedSolution,
    });
  }
}
