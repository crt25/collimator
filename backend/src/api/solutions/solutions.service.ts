import { Injectable } from "@nestjs/common";
import { Solution, Prisma, SolutionAnalysis } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import { getCurrentAnalyses, deleteStudentSolutions } from "@prisma/client/sql";

import { SolutionId } from "./dto";
import { Cron } from "@nestjs/schedule";
import { SolutionAnalysisService } from "./solution-analysis.service";

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

export type CurrentAnalysis = getCurrentAnalyses.Result;

const maximumNumberOfAnalysisRetries = 3;

const omitData = { data: true };

@Injectable()
export class SolutionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly analysisService: SolutionAnalysisService,
  ) {}

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

  findCurrentAnalyses(
    sessionId: number,
    taskId: number,
  ): Promise<CurrentAnalysis[]> {
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

  /**
   * Deletes the current solution by its ID, as well as all previous solutions
   * by that student for that session/task. This is a demo convenience method.
   * @param sessionId
   * @param taskId
   * @param id
   */
  async deleteAllSolutionsById(
    sessionId: number,
    taskId: number,
    id: SolutionId,
  ): Promise<boolean> {
    const result = await this.prisma.$queryRawTyped(
      deleteStudentSolutions(sessionId, taskId, id),
    );
    const deletedRows = result[0]?.count ?? 0;
    return deletedRows > 0;
  }

  async create(
    solutionInput: SolutionCreateInput,
    mimeType: string,
    data: Buffer,
  ): Promise<Solution> {
    const { studentId, sessionId, taskId, ...rest } = solutionInput;
    const checkedSolution: Prisma.SolutionCreateInput = {
      ...rest,
      mimeType,
      data,
      student: { connect: { id: studentId } },
      session: { connect: { id: sessionId } },
      task: { connect: { id: taskId } },
      sessionTask: { connect: { sessionId_taskId: { sessionId, taskId } } },
    };

    const solution = await this.prisma.solution.create({
      data: checkedSolution,
    });

    // perform the analysis but do *not* wait for the promise to resolve
    // this will happen in the background
    this.analysisService.performAnalysis(solution);

    return solution;
  }

  // check every minute (with seconds = 0) whether there are analyses that were not performed
  @Cron("0 * * * * *", { name: "runUnperformedAnalyes" })
  async runUnperformedAnalyes(): Promise<void> {
    const solutionsWithoutAnalysis = await this.prisma.solution.findMany({
      where: {
        AND: [
          {
            analysis: null,
          },
          {
            failedAnalyses: {
              lt: maximumNumberOfAnalysisRetries,
            },
          },
        ],
      },
    });

    // run all of them
    await Promise.all(
      solutionsWithoutAnalysis.map((solution) =>
        this.analysisService
          .performAnalysis(solution)
          // ignore exceptions, we'll just re-try
          .catch(),
      ),
    );
  }
}
