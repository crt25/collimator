import { Injectable } from "@nestjs/common";
import { Solution, Prisma, SolutionAnalysis, AstVersion } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import { getCurrentAnalyses, deleteStudentSolutions } from "@prisma/client/sql";

import { Cron } from "@nestjs/schedule";
import { SentryCron } from "@sentry/nestjs";
import { SolutionId } from "./dto";
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

const latestAstVersion = AstVersion.v1;

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

  async findCurrentAnalyses(
    sessionId: number,
    taskId: number,
  ): Promise<CurrentAnalysis[]> {
    const analyses = await this.prisma.$queryRawTyped(
      getCurrentAnalyses(sessionId, taskId),
    );

    // filter out analyses that are not of the latest AST version
    return analyses.filter(
      (analysis) => analysis.astVersion === latestAstVersion,
    );
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

  downloadLatestStudentSolutionOrThrow(
    sessionId: number,
    taskId: number,
    studentId: number,
  ): Promise<SolutionDataOnly> {
    return this.prisma.solution.findFirstOrThrow({
      select: { data: true, mimeType: true },
      where: { sessionId, taskId, studentId },
      orderBy: {
        createdAt: "desc",
      },
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
    this.analysisService.performAnalysis(solution, latestAstVersion);

    return solution;
  }

  // check every minute (with seconds = 0) whether there are analyses that were not performed
  @Cron("0 * * * * *", { name: "runUnperformedAnalyes" })
  @SentryCron("runUnperformedAnalyes", {
    schedule: {
      type: "crontab",
      value: "0 * * * * *",
    },
    checkinMargin: 1, // In minutes.
    maxRuntime: 5, // In minutes.
  })
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
          .performAnalysis(solution, latestAstVersion)
          // ignore exceptions, we'll just re-try
          .catch(),
      ),
    );
  }

  // check every minute (with seconds = 30) whether there are analyses that were not upgraded
  @Cron("30 * * * * *", { name: "runUpgradeAnalyes" })
  @SentryCron("runUpgradeAnalyes", {
    schedule: {
      type: "crontab",
      value: "30 * * * * *",
    },
    checkinMargin: 5, // In minutes.
    maxRuntime: 30, // In minutes.
  })
  async runUpgradeAnalyes(): Promise<void> {
    const solutionsWithoutAnalysis =
      await this.prisma.solutionAnalysis.findMany({
        where: {
          AND: [
            {
              NOT: {
                astVersion: latestAstVersion,
              },
            },
            {
              solution: {
                failedAnalyses: {
                  lt: maximumNumberOfAnalysisRetries,
                },
              },
            },
          ],
        },
        select: {
          solution: true,
        },
      });

    // run all of them
    await Promise.all(
      solutionsWithoutAnalysis.map(({ solution }) =>
        this.analysisService
          .performAnalysis(solution, latestAstVersion)
          // ignore exceptions, we'll just re-try
          .catch(),
      ),
    );
  }
}
