import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import {
  AstVersion,
  Prisma,
  ReferenceSolution,
  Solution,
  SolutionAnalysis,
  SolutionTest,
  StudentSolution,
} from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import {
  deleteStudentSolutions,
  getCurrentAnalysesWithActivities,
  getSoftDeletedCurrentAnalysesWithActivities,
} from "@prisma/client/sql";

import { Cron } from "@nestjs/schedule";
import { SentryCron } from "@sentry/nestjs";
import { TupleMap } from "src/utilities/tuple-map";
import { TaskId } from "../tasks/dto";
import { TasksService } from "../tasks/tasks.service";
import { SessionId } from "../sessions/dto";
import { SolutionAnalysisService } from "./solution-analysis.service";
import { maximumNumberOfAnalysisRetries } from "./solution-analysis.constants";
import { StudentSolutionId } from "./dto/existing-student-solution.dto";
import { ReferenceSolutionId } from "./dto/existing-reference-solution.dto";

export type StudentId = number;
type CurrentAnalysisRow = getCurrentAnalysesWithActivities.Result;
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

type StudentKey = [
  studentId: StudentId,
  taskId: TaskId,
  studentSolutionId: StudentSolutionId | null,
  solutionHash: string,
  isReference: boolean,
];
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
  studentSolutionId: StudentSolutionId | null;
  isStudentSolution: boolean;
  studentPseudonym: Uint8Array | null;
  studentKeyPairId: number | null;
  isLatest: boolean;
};

export type ReferenceAnalysis = AnalysisWithoutId & {
  title: string;
  description: string;
  isInitialTaskSolution: boolean;
  referenceSolutionId: ReferenceSolutionId;
};

type NullablePartial<T> = { [K in keyof T]?: T[K] | null };

const omitData = { data: true };

const latestAstVersion = AstVersion.v1;

@Injectable()
export class SolutionsService {
  private readonly logger = new Logger(SolutionsService.name);

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
    // When true, student activities are excluded so only submitted solutions
    // are returned. Used by the analysis dashboard (CRT-339), where a newer,
    // testless activity snapshot must not shadow the graded submission and
    // drop its passed-test count.
    studentSolutionsOnly = false,
    // When true, past starred solutions are dropped; the student's latest
    // solution is still returned even when it is starred. Used by the analysis
    // dashboard (CRT-339), which only cares about current solutions.
    ignoreStarredSolutions = false,
  ): Promise<[CurrentStudentAnalysis[], ReferenceAnalysis[]]> {
    const analyses = await this.prisma.$queryRawTyped(
      includeSoftDelete
        ? getSoftDeletedCurrentAnalysesWithActivities(
            sessionId,
            taskId,
            studentSolutionsOnly,
            ignoreStarredSolutions,
          )
        : getCurrentAnalysesWithActivities(
            sessionId,
            taskId,
            studentSolutionsOnly,
            ignoreStarredSolutions,
          ),
    );

    return this.groupAnalyses(analyses);
  }

  private groupAnalyses(
    analyses: CurrentAnalysisRow[],
  ): [CurrentStudentAnalysis[], ReferenceAnalysis[]] {
    const filteredAnalyses = analyses.filter(
      (analysis) => analysis.astVersion === latestAstVersion,
    );

    const studentAnalyses: CurrentAnalysisRow[] = [];
    const referenceAnalyses: CurrentAnalysisRow[] = [];

    for (const analysis of filteredAnalyses) {
      if (analysis.studentId !== null) {
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
            ([studentId, taskId, solutionId, solutionHash, isReference]) =>
              `${studentId?.toString()};${taskId};${solutionId};${solutionHash};${isReference}`,
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

  private isTest(test: NullablePartial<SolutionTest>): test is SolutionTest {
    return (
      test.name !== null &&
      test.passed !== null &&
      test.name !== undefined &&
      test.passed !== undefined &&
      test.identifier !== undefined &&
      test.contextName !== undefined
    );
  }

  private groupByStudentAnalysis(
    byAnalysisId: TupleMap<StudentKey, CurrentStudentAnalysis>,
    analysis: CurrentAnalysisRow,
  ): TupleMap<StudentKey, CurrentStudentAnalysis> {
    if (!this.isStudentAnalysis(analysis)) {
      throw new Error(
        `Query response for 'getCurrentAnalysesWithActivities' is missing student analysis data. ${JSON.stringify(analysis)}`,
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
      Buffer.from(analysis.solutionHash).toString("base64"),
      analysis.isReference,
    ];
    const currentAnalysis = byAnalysisId.get(key);

    if (currentAnalysis !== undefined) {
      if (this.isTest(test)) {
        currentAnalysis.tests.push(test);
      }

      if (analysis.isLatest) {
        currentAnalysis.isLatest = true;
      }
    } else {
      byAnalysisId.set(key, {
        taskId: analysis.taskId,
        solutionHash: analysis.solutionHash,
        isReferenceSolution: analysis.isReference,
        genericAst: analysis.genericAst,
        astVersion: analysis.astVersion,
        tests: this.isTest(test) ? [test] : [],
        studentId: analysis.studentId,
        sessionId: analysis.sessionId,
        studentPseudonym: analysis.studentPseudonym,
        studentSolutionId: analysis.studentSolutionId,
        isStudentSolution: analysis.isStudentSolution ?? false,
        studentKeyPairId: analysis.studentKeyPairId,
        isLatest: analysis.isLatest ?? false,
      });
    }

    return byAnalysisId;
  }

  private isStudentAnalysis(
    analysis: CurrentAnalysisRow,
  ): analysis is CurrentAnalysisRow & {
    taskId: TaskId;
    studentSolutionId: StudentSolutionId | null;
    isStudentSolution: boolean;
    studentId: StudentId;
    studentPseudonym: Uint8Array | null;
    sessionId: SessionId;
    isReference: boolean;
    solutionHash: Uint8Array;
    testName: string | null;
    testPassed: boolean | null;
    genericAst: string;
    astVersion: AstVersion;
  } {
    return (
      analysis.taskId !== null &&
      analysis.studentId !== null &&
      analysis.sessionId !== null &&
      analysis.isReference !== null &&
      analysis.solutionHash !== null &&
      analysis.genericAst !== null &&
      analysis.astVersion !== null
    );
  }

  private groupByReferenceAnalysis(
    byAnalysisId: TupleMap<ReferenceKey, ReferenceAnalysis>,
    analysis: CurrentAnalysisRow,
  ): TupleMap<ReferenceKey, ReferenceAnalysis> {
    if (!this.isReferenceAnalysis(analysis)) {
      throw new Error(
        `Query response for 'getCurrentAnalysesWithActivities' is missing reference analysis data. ${JSON.stringify(analysis)}`,
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

    if (currentAnalysis !== undefined && this.isTest(test)) {
      currentAnalysis.tests.push(test);
    } else if (currentAnalysis === undefined) {
      byAnalysisId.set(key, {
        taskId: analysis.taskId,
        solutionHash: analysis.solutionHash,
        isReferenceSolution: true,
        isInitialTaskSolution: analysis.isInitialTaskSolution,
        genericAst: analysis.genericAst,
        astVersion: analysis.astVersion,
        tests: this.isTest(test) ? [test] : [],
        referenceSolutionId: analysis.referenceSolutionId,
        title: analysis.referenceSolutionTitle,
        description: analysis.referenceSolutionDescription,
      });
    }

    return byAnalysisId;
  }

  private isReferenceAnalysis(
    analysis: CurrentAnalysisRow,
  ): analysis is CurrentAnalysisRow & {
    referenceSolutionId: ReferenceSolutionId;
    referenceSolutionTitle: string;
    referenceSolutionDescription: string;
    isInitialTaskSolution: boolean;
    taskId: TaskId;
    solutionHash: Uint8Array;
    testName: string | null;
    testPassed: boolean | null;
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
      analysis.genericAst !== null &&
      analysis.astVersion !== null
    );
  }

  findAnalysisOrThrow(
    taskId: number,
    hash: Uint8Array,
    includeSoftDelete = false,
  ): Promise<SolutionAnalysis> {
    return this.prisma.solutionAnalysis.findUniqueOrThrow({
      where: includeSoftDelete
        ? { taskId_solutionHash: { taskId, solutionHash: hash } }
        : {
            taskId_solutionHash: { taskId, solutionHash: hash },
            deletedAt: null,
          },
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

  async updateStudentReferenceSolutions(
    classId: number,
    sessionId: SessionId,
    taskId: TaskId,
    studentId: StudentId,
    solutionHashes: Uint8Array[],
    isReference: boolean,
    includeSoftDelete = false,
  ): Promise<void> {
    const uniqueSolutionHashes = [
      ...new Map(
        solutionHashes.map((solutionHash) => [
          Buffer.from(solutionHash).toString("base64url"),
          solutionHash,
        ]),
      ).values(),
    ];

    if (uniqueSolutionHashes.length === 0) {
      return;
    }

    const sourceWhere = {
      studentId,
      sessionId,
      taskId,
      session: { classId },
      ...(includeSoftDelete ? {} : { deletedAt: null }),
    };

    await this.prisma.$transaction(async (tx) => {
      const targetSolutions = await tx.solution.findMany({
        select: { hash: true },
        where: {
          taskId,
          hash: { in: uniqueSolutionHashes },
          ...(includeSoftDelete ? {} : { deletedAt: null }),
          analysis: { isNot: null },
          OR: [
            { studentSolutions: { some: sourceWhere } },
            { studentActivities: { some: sourceWhere } },
          ],
        },
      });

      if (targetSolutions.length !== uniqueSolutionHashes.length) {
        throw new NotFoundException(
          `Not every analyzed solution was found for student ${studentId} in class ${classId} / session ${sessionId} / task ${taskId}`,
        );
      }

      const referenceKeys = uniqueSolutionHashes.map((solutionHash) => ({
        solutionHash,
        studentId,
        sessionId,
        taskId,
      }));

      if (isReference) {
        await tx.solutionActivityReference.createMany({
          data: referenceKeys,
          skipDuplicates: true,
        });
      } else {
        await tx.solutionActivityReference.deleteMany({
          where: {
            studentId,
            sessionId,
            taskId,
            solutionHash: { in: uniqueSolutionHashes },
          },
        });
      }

      this.logger.log(
        `${isReference ? "Created" : "Removed"} ${uniqueSolutionHashes.length} solution activity reference(s) (studentId: ${studentId}, classId: ${classId}, sessionId: ${sessionId}, taskId: ${taskId})`,
      );
    });
  }

  async downloadLatestStudentSolutionOrThrow(
    sessionId: number,
    taskId: number,
    studentId: number,
    includeSoftDelete = false,
  ): Promise<SolutionDataOnly> {
    const latestStudentSolution = await this.prisma.studentSolution.findFirst({
      select: {
        solution: { select: { data: true, mimeType: true } },
        id: true,
        createdAt: true,
        happenedAt: true,
      },
      where: includeSoftDelete
        ? { studentId, taskId, sessionId }
        : { studentId, taskId, sessionId, deletedAt: null },
      orderBy: [
        { happenedAt: "desc" },
        // The id is unique, so it is enough to break ties when two client
        // timestamps are exactly the same.
        { id: "desc" },
      ],
    });

    const latestStudentActivity = await this.prisma.studentActivity.findFirst({
      select: {
        solution: { select: { data: true, mimeType: true } },
        id: true,
        createdAt: true,
        happenedAt: true,
        happenedAtCounter: true,
      },
      where: includeSoftDelete
        ? { studentId, taskId, sessionId }
        : { studentId, taskId, sessionId, deletedAt: null },
      orderBy: [
        { happenedAt: "desc" },
        { happenedAtCounter: "desc" },
        { createdAt: "desc" },
        { id: "desc" },
      ],
    });

    if (!latestStudentSolution && !latestStudentActivity) {
      throw new NotFoundException();
    }

    if (latestStudentSolution && latestStudentActivity) {
      // prefer the most recent solution by client timestamp
      const isStudentSolutionNewerThanActivity =
        latestStudentSolution.happenedAt.getTime() >
          latestStudentActivity.happenedAt.getTime() ||
        (latestStudentSolution.happenedAt.getTime() ===
          latestStudentActivity.happenedAt.getTime() &&
          latestStudentSolution.createdAt.getTime() >=
            latestStudentActivity.createdAt.getTime());

      return isStudentSolutionNewerThanActivity
        ? latestStudentSolution.solution
        : latestStudentActivity.solution;
    }

    return (latestStudentSolution || latestStudentActivity)!.solution;
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
      where: {
        ...args?.where,
        ...(includeSoftDeleted ? undefined : { deletedAt: null }),
      },
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

    if (deletedRows > 0) {
      this.logger.log(
        `Deleted ${deletedRows} student solutions for session (id: ${sessionId}), task (id: ${taskId})`,
      );
    } else {
      this.logger.log(
        `Unexpected: attempted to delete student solution (id: ${id}) for session (id: ${sessionId}), task (id: ${taskId}), but it no longer exists`,
      );
    }

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

    this.logger.log(
      `Created student solution (id: ${studentSolution.id}) for student (id: ${studentId}), session (id: ${sessionId}), task (id: ${taskId})`,
    );

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

    if (solutionsWithoutAnalysis.length > 0) {
      this.logger.log(`Running ${solutionsWithoutAnalysis.length} analyses`);
    }

    // run all of them
    await Promise.all(
      solutionsWithoutAnalysis.map((solution) =>
        this.analysisService
          .performAnalysis(solution, latestAstVersion)
          // consume the rejection so one failed analysis does not reject the
          // entire Promise.all batch as it will be retried by the next run
          .catch(() => undefined),
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

    if (solutionsWithoutAnalysis.length > 0) {
      this.logger.log(
        `Upgrading ${solutionsWithoutAnalysis.length} analyses to latest AST version`,
      );
    }

    // run all of them
    await Promise.all(
      solutionsWithoutAnalysis.map(({ solution }) =>
        this.analysisService
          .performAnalysis(solution, latestAstVersion)
          // consume the rejection so one failed analysis does not reject the
          // entire Promise.all batch as it will be retried by the next run
          .catch(() => undefined),
      ),
    );
  }
}
