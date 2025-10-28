import { Injectable, NotFoundException } from "@nestjs/common";
import {
  Solution,
  Prisma,
  SolutionAnalysis,
  AstVersion,
  StudentSolution,
  SolutionTest,
  ReferenceSolution,
} from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import {
  getCurrentAnalyses,
  deleteStudentSolutions,
  getSoftDeletedCurrentAnalyses,
} from "@prisma/client/sql";

import { Cron } from "@nestjs/schedule";
import { SentryCron } from "@sentry/nestjs";
import { TupleMap } from "src/utilities/tuple-map";
import { TaskId } from "../tasks/dto";
import { TasksService } from "../tasks/tasks.service";
import { SessionId } from "../sessions/dto";
import { SolutionAnalysisService } from "./solution-analysis.service";
import { StudentSolutionId } from "./dto/existing-student-solution.dto";
import { ReferenceSolutionId } from "./dto/existing-reference-solution.dto";

export type StudentId = number;
export type SolutionCreateInput = Omit<
  Prisma.SolutionUncheckedCreateInput,
  "data" | "mimeType"
>;

export type StudentSolutionCreateInput = Omit<
  Prisma.StudentSolutionUncheckedCreateInput,
  "solutionHash"
>;

export type SolutionUpdateInput = Omit<
  Prisma.SolutionUpdateInput,
  "data" | "mimeType"
>;
export type SolutionWithoutData = Omit<Solution, "data">;
export type SolutionDataOnly = Pick<Solution, "data" | "mimeType">;

type WithTestsAndSolution<T> = T & {
  tests: SolutionTest[];
  solution: SolutionWithoutData;
};

export type StudentSolutionWithoutData = WithTestsAndSolution<StudentSolution>;
export type ReferenceSolutionWithoutData =
  WithTestsAndSolution<ReferenceSolution>;

export type SolutionAnalysisCreateInput = Omit<
  Prisma.SolutionAnalysisUncheckedCreateInput,
  "id"
>;

type StudentKey = [StudentId, TaskId, StudentSolutionId];
type ReferenceKey = [TaskId, ReferenceSolutionId];

export type AnalysisWithoutId = {
  taskId: number;
  solutionHash: Uint8Array;
  isReferenceSolution: boolean;
  genericAst: string;
  astVersion: AstVersion;
  tests: {
    identifier: string | null;
    name: string;
    contextName: string | null;
    passed: boolean;
  }[];
};

export type CurrentStudentAnalysis = AnalysisWithoutId & {
  studentId: number;
  sessionId: number;
  studentSolutionId: StudentSolutionId;
  studentPseudonym: Uint8Array | null;
  studentKeyPairId: number | null;
};

export type ReferenceAnalysis = AnalysisWithoutId & {
  title: string;
  description: string;
  isInitialTaskSolution: boolean;
  referenceSolutionId: ReferenceSolutionId;
};

const maximumNumberOfAnalysisRetries = 3;

const omitData = { data: true };

const latestAstVersion = AstVersion.v1;

@Injectable()
export class SolutionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tasksService: TasksService,
    private readonly analysisService: SolutionAnalysisService,
  ) {}

  findByStudentIdOrThrow(
    sessionId: number,
    taskId: number,
    id: StudentSolutionId,
    includeSoftDelete = false,
  ): Promise<StudentSolutionWithoutData> {
    return this.prisma.studentSolution.findUniqueOrThrow({
      include: {
        tests: {
          where: includeSoftDelete ? {} : { deletedAt: null },
        },
        solution: {
          omit: omitData,
        },
      },
      where: includeSoftDelete
        ? { id, sessionId, taskId }
        : { id, sessionId, taskId, deletedAt: null },
    });
  }

  async findCurrentAnalyses(
    sessionId: number,
    taskId: number,
    includeSoftDelete = false,
  ): Promise<[CurrentStudentAnalysis[], ReferenceAnalysis[]]> {
    let analyses;

    if (includeSoftDelete) {
      analyses = await this.prisma.$queryRawTyped(
        getSoftDeletedCurrentAnalyses(sessionId, taskId),
      );
    } else {
      analyses = await this.prisma.$queryRawTyped(
        getCurrentAnalyses(sessionId, taskId),
      );
    }

    const filteredAnalyses = analyses.filter(
      (analysis) => analysis.astVersion === latestAstVersion,
    );

    const studentAnalyses: getCurrentAnalyses.Result[] = [];
    const referenceAnalyses: getCurrentAnalyses.Result[] = [];

    for (const analysis of filteredAnalyses) {
      if (analysis.studentSolutionId) {
        studentAnalyses.push(analysis);
      } else {
        referenceAnalyses.push(analysis);
      }
    }

    const groupedStudentAnalyses = [
      ...studentAnalyses
        .reduce(
          this.groupByStudentAnalysis.bind(this),
          new TupleMap<StudentKey, CurrentStudentAnalysis>(
            ([studentId, taskId, solutionId]) =>
              `${studentId?.toString()};${taskId};${solutionId}`,
          ),
        )
        .values(),
    ];

    const groupedReferenceAnalyses = [
      ...referenceAnalyses
        .reduce(
          this.groupByReferenceAnalysis.bind(this),
          new TupleMap<ReferenceKey, ReferenceAnalysis>(
            ([taskId, solutionId]) => `${taskId};${solutionId}`,
          ),
        )
        .values(),
    ];

    // filter out analyses that are not of the latest AST version
    return [groupedStudentAnalyses, groupedReferenceAnalyses];
  }

  private groupByStudentAnalysis(
    byAnalysisId: TupleMap<StudentKey, CurrentStudentAnalysis>,
    analysis: getCurrentAnalyses.Result,
  ): TupleMap<StudentKey, CurrentStudentAnalysis> {
    if (!this.isStudentAnalysis(analysis)) {
      throw new Error(
        `Query response for 'getCurrentAnalyses' is missing student analysis data. ${JSON.stringify(analysis)}`,
      );
    }

    const test = {
      identifier: analysis.testIdentifier,
      name: analysis.testName,
      contextName: analysis.testContextName,
      passed: analysis.testPassed,
    };

    const key: StudentKey = [
      analysis.studentId,
      analysis.taskId,
      analysis.studentSolutionId,
    ];
    const currentAnalysis = byAnalysisId.get(key);

    if (currentAnalysis !== undefined) {
      currentAnalysis.tests.push(test);
    } else {
      byAnalysisId.set(key, {
        taskId: analysis.taskId,
        solutionHash: analysis.solutionHash,
        isReferenceSolution: analysis.isReference,
        genericAst: analysis.genericAst,
        astVersion: analysis.astVersion,
        tests: [test],
        studentId: analysis.studentId,
        sessionId: analysis.sessionId,
        studentPseudonym: analysis.studentPseudonym,
        studentSolutionId: analysis.studentSolutionId,
        studentKeyPairId: analysis.studentKeyPairId,
      });
    }

    return byAnalysisId;
  }

  private isStudentAnalysis(
    analysis: getCurrentAnalyses.Result,
  ): analysis is getCurrentAnalyses.Result & {
    taskId: TaskId;
    studentSolutionId: StudentSolutionId;
    studentId: StudentId;
    studentPseudonym: Uint8Array | null;
    sessionId: SessionId;
    isReference: boolean;
    solutionHash: Uint8Array;
    testName: string;
    testPassed: boolean;
    genericAst: string;
    astVersion: AstVersion;
  } {
    return (
      analysis.taskId !== null &&
      analysis.studentSolutionId !== null &&
      analysis.studentId !== null &&
      analysis.sessionId !== null &&
      analysis.isReference !== null &&
      analysis.solutionHash !== null &&
      analysis.testName !== null &&
      analysis.testPassed !== null &&
      analysis.genericAst !== null &&
      analysis.astVersion !== null
    );
  }

  private groupByReferenceAnalysis(
    byAnalysisId: TupleMap<ReferenceKey, ReferenceAnalysis>,
    analysis: getCurrentAnalyses.Result,
  ): TupleMap<ReferenceKey, ReferenceAnalysis> {
    if (!this.isReferenceAnalysis(analysis)) {
      throw new Error(
        `Query response for 'getCurrentAnalyses' is missing reference analysis data. ${JSON.stringify(analysis)}`,
      );
    }

    const test = {
      identifier: analysis.testIdentifier,
      name: analysis.testName,
      contextName: analysis.testContextName,
      passed: analysis.testPassed,
    };

    const key: ReferenceKey = [analysis.taskId, analysis.referenceSolutionId];
    const currentAnalysis = byAnalysisId.get(key);

    if (currentAnalysis !== undefined) {
      currentAnalysis.tests.push(test);
    } else {
      byAnalysisId.set(key, {
        taskId: analysis.taskId,
        solutionHash: analysis.solutionHash,
        isReferenceSolution: true,
        isInitialTaskSolution: analysis.isInitialTaskSolution,
        genericAst: analysis.genericAst,
        astVersion: analysis.astVersion,
        tests: [test],

        referenceSolutionId: analysis.referenceSolutionId,
        title: analysis.referenceSolutionTitle,
        description: analysis.referenceSolutionDescription,
      });
    }

    return byAnalysisId;
  }

  private isReferenceAnalysis(
    analysis: getCurrentAnalyses.Result,
  ): analysis is getCurrentAnalyses.Result & {
    referenceSolutionId: ReferenceSolutionId;
    referenceSolutionTitle: string;
    referenceSolutionDescription: string;
    isInitialTaskSolution: boolean;
    taskId: TaskId;
    solutionHash: Uint8Array;
    testName: string;
    testPassed: boolean;
    genericAst: string;
    astVersion: AstVersion;
  } {
    return (
      analysis.referenceSolutionId !== null &&
      analysis.referenceSolutionTitle !== null &&
      analysis.referenceSolutionDescription !== null &&
      analysis.isInitialTaskSolution !== null &&
      analysis.taskId !== null &&
      analysis.solutionHash !== null &&
      analysis.testName !== null &&
      analysis.testPassed !== null &&
      analysis.genericAst !== null &&
      analysis.astVersion !== null
    );
  }

  findAnalysisOrThrow(
    taskId: number,
    hash: Uint8Array,
  ): Promise<SolutionAnalysis> {
    return this.prisma.solutionAnalysis.findUniqueOrThrow({
      where: { taskId_solutionHash: { taskId, solutionHash: hash } },
    });
  }

  downloadByHashOrThrow(
    taskId: number,
    solutionHash: Uint8Array,
    includeSoftDelete = false,
  ): Promise<SolutionDataOnly> {
    return this.prisma.solution.findUniqueOrThrow({
      select: { data: true, mimeType: true },
      where: includeSoftDelete
        ? {
            taskId_hash: {
              taskId,
              hash: solutionHash,
            },
          }
        : {
            taskId_hash: {
              taskId,
              hash: solutionHash,
            },
            deletedAt: null,
          },
    });
  }

  async updateStudentSolutionIsReference(
    studentSolutionId: number,
    isReference: boolean,
    includeSoftDelete = false,
  ): Promise<void> {
    await this.prisma.studentSolution.update({
      data: {
        isReference,
      },
      where: includeSoftDelete
        ? {
            id: studentSolutionId,
          }
        : {
            id: studentSolutionId,
            deletedAt: null,
          },
    });
  }

  async downloadLatestStudentSolutionOrThrow(
    sessionId: number,
    taskId: number,
    studentId: number,
    includeSoftDelete = false,
  ): Promise<SolutionDataOnly> {
    const latestSubmittedSolution = await this.prisma.studentSolution.findFirst(
      {
        select: {
          solution: { select: { data: true, mimeType: true } },
          createdAt: true,
        },
        where: includeSoftDelete
          ? { studentId, taskId, sessionId }
          : { studentId, taskId, sessionId, deletedAt: null },
        orderBy: {
          createdAt: "desc",
        },
      },
    );

    const solutionFromLatestActivity =
      await this.prisma.studentActivity.findFirst({
        select: {
          solution: { select: { data: true, mimeType: true } },
          createdAt: true,
        },
        where: { studentId, taskId, sessionId },
        orderBy: {
          createdAt: "desc",
        },
      });

    if (!latestSubmittedSolution && !solutionFromLatestActivity) {
      throw new NotFoundException();
    }

    if (latestSubmittedSolution && solutionFromLatestActivity) {
      // prefer the most recent solution
      return latestSubmittedSolution.createdAt >
        solutionFromLatestActivity.createdAt
        ? latestSubmittedSolution.solution
        : solutionFromLatestActivity.solution;
    }

    return (latestSubmittedSolution || solutionFromLatestActivity)!.solution;
  }

  findManyStudentSolutions(
    args?: Prisma.StudentSolutionFindManyArgs,
    includeSoftDeleted = false,
  ): Promise<StudentSolutionWithoutData[]> {
    const where = includeSoftDeleted
      ? args?.where
      : { ...args?.where, deletedAt: null };

    return this.prisma.studentSolution.findMany({
      ...args,
      where,
      include: {
        solution: {
          omit: omitData,
        },
        tests: {
          where: includeSoftDeleted ? {} : { deletedAt: null },
        },
      },
    });
  }

  findMany(
    args?: Prisma.SolutionFindManyArgs,
    includeSoftDeleted = false,
  ): Promise<SolutionWithoutData[]> {
    return this.prisma.solution.findMany({
      ...args,
      where: includeSoftDeleted ? undefined : { deletedAt: null },
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
  async deleteAllStudentSolutionsById(
    sessionId: number,
    taskId: number,
    id: StudentSolutionId,
  ): Promise<boolean> {
    const result = await this.prisma.$queryRawTyped(
      deleteStudentSolutions(sessionId, taskId, id),
    );
    const deletedRows = result[0]?.count ?? 0;
    return deletedRows > 0;
  }

  async createStudentSolution(
    studentSolutionInput: StudentSolutionCreateInput,
    mimeType: string,
    data: Uint8Array,
  ): Promise<StudentSolutionWithoutData> {
    const { studentId, sessionId, taskId, ...rest } = studentSolutionInput;

    const hash = this.tasksService.computeSolutionHash(data);

    const checkedStudentSolution: Prisma.StudentSolutionCreateInput = {
      ...rest,

      student: { connect: { id: studentId } },
      session: { connect: { id: sessionId } },
      task: { connect: { id: taskId } },
      sessionTask: { connect: { sessionId_taskId: { sessionId, taskId } } },
      solution: {
        connectOrCreate: {
          create: {
            mimeType,
            data,
            hash,
            task: {
              connect: { id: taskId },
            },
          },
          where: {
            taskId_hash: {
              taskId,
              hash,
            },
          },
        },
      },
    };

    const studentSolution = await this.prisma.studentSolution.create({
      data: checkedStudentSolution,
      include: {
        solution: true,
        tests: true,
      },
    });

    // perform the analysis but do *not* wait for the promise to resolve
    // this will happen in the background
    this.analysisService.performAnalysis(
      studentSolution.solution,
      latestAstVersion,
    );

    return studentSolution;
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
          {
            deletedAt: null,
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
                deletedAt: null,
              },
            },
            {
              deletedAt: null,
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
