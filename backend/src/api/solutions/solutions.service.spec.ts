import { NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { DeepMockProxy, mockDeep } from "jest-mock-extended";
import { AstVersion, PrismaClient, Solution } from "@prisma/client";
import { CoreModule } from "src/core/core.module";
import { PrismaService } from "src/prisma/prisma.service";
import { mockConfigModule } from "src/utilities/test/mock-config.service";
import { AstConversionService } from "src/ast/ast-conversion.service";
import { getCurrentAnalysesWithActivities } from "@prisma/client/sql";
import { TasksService } from "../tasks/tasks.service";
import { SolutionAnalysisService } from "./solution-analysis.service";
import { CurrentStudentAnalysis, SolutionsService } from "./solutions.service";

type QueryRow = getCurrentAnalysesWithActivities.Result;

const sessionId = 1;
const taskId = 2;
const buildSolution = (hash: Uint8Array): Solution => ({
  taskId,
  hash,
  data: new Uint8Array(),
  mimeType: "application/octet-stream",
  failedAnalyses: 0,
  deletedAt: null,
});

const buildStudentAnalysisRow = (
  overrides: Partial<QueryRow> = {},
): QueryRow => ({
  genericAst: '{"type":"program"}',
  astVersion: AstVersion.v1,
  solutionHash: new Uint8Array([1, 2, 3]),
  taskId: taskId,
  deletedAt: null,
  testIdentifier: null,
  testName: null,
  testContextName: null,
  testPassed: null,
  studentId: 1,
  studentPseudonym: null,
  studentKeyPairId: null,
  isLatest: true,
  isReference: false,
  isStudentSolution: true,
  studentSolutionId: 100,
  sessionId: sessionId,
  referenceSolutionId: null,
  referenceSolutionTitle: null,
  referenceSolutionDescription: null,
  isInitialTaskSolution: null,
  ...overrides,
});

const buildReferenceAnalysisRow = (
  overrides: Partial<QueryRow> = {},
): QueryRow => ({
  genericAst: '{"type":"reference"}',
  astVersion: AstVersion.v1,
  solutionHash: new Uint8Array([4, 5, 6]),
  taskId: taskId,
  deletedAt: null,
  testIdentifier: null,
  testName: null,
  testContextName: null,
  testPassed: null,
  studentId: null,
  studentPseudonym: null,
  isLatest: true,
  studentKeyPairId: null,
  isReference: true,
  isStudentSolution: false,
  studentSolutionId: null,
  sessionId: null,
  referenceSolutionId: 200,
  referenceSolutionTitle: "Reference",
  referenceSolutionDescription: "A reference solution",
  isInitialTaskSolution: false,
  ...overrides,
});

describe("SolutionsService", () => {
  let service: SolutionsService;
  let prismaMock: DeepMockProxy<PrismaClient>;
  let module: TestingModule;

  beforeEach(async () => {
    prismaMock = mockDeep<PrismaClient>();
    prismaMock.$transaction.mockImplementation((callback) =>
      callback(prismaMock),
    );

    module = await Test.createTestingModule({
      imports: [CoreModule, mockConfigModule],
      providers: [
        TasksService,
        AstConversionService,
        SolutionAnalysisService,
        SolutionsService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<SolutionsService>(SolutionsService);
  });

  afterEach(() => {
    module.close();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("findCurrentAnalysesWithActivities", () => {
    it("returns empty arrays when the query returns no rows", async () => {
      prismaMock.$queryRawTyped.mockResolvedValue([]);

      const [studentAnalyses, referenceAnalyses] =
        await service.findCurrentAnalysesWithActivities(sessionId, taskId);

      expect(studentAnalyses).toEqual([]);
      expect(referenceAnalyses).toEqual([]);
    });

    it("returns a single student analysis for one row without tests", async () => {
      const row = buildStudentAnalysisRow();
      prismaMock.$queryRawTyped.mockResolvedValue([row]);

      const [studentAnalyses, referenceAnalyses] =
        await service.findCurrentAnalysesWithActivities(sessionId, taskId);

      const expected: Partial<CurrentStudentAnalysis> = {
        taskId: taskId,
        studentId: row.studentId!,
        sessionId: sessionId,
        studentSolutionId: row.studentSolutionId,
        solutionHash: row.solutionHash!,
        genericAst: row.genericAst!,
        isReferenceSolution: false,
        tests: [],
      };
      expect(referenceAnalyses).toEqual([]);
      expect(studentAnalyses).toHaveLength(1);
      expect(studentAnalyses[0]).toMatchObject(expected);
    });

    it("merges multiple rows for the same student solution into one analysis with all tests", async () => {
      const baseRow = buildStudentAnalysisRow();
      const rowWithFirstTest = buildStudentAnalysisRow({
        testName: "test1",
        testPassed: true,
        testIdentifier: "id1",
        testContextName: "ctx1",
      });
      const rowWithSecondTest = buildStudentAnalysisRow({
        testName: "test2",
        testPassed: false,
        testIdentifier: "id2",
        testContextName: "ctx2",
      });
      prismaMock.$queryRawTyped.mockResolvedValue([
        baseRow,
        rowWithFirstTest,
        rowWithSecondTest,
      ]);

      const [studentAnalyses] = await service.findCurrentAnalysesWithActivities(
        sessionId,
        taskId,
      );

      expect(studentAnalyses).toHaveLength(1);
      expect(studentAnalyses[0].tests).toEqual([
        {
          identifier: "id1",
          name: "test1",
          contextName: "ctx1",
          passed: true,
        },
        {
          identifier: "id2",
          name: "test2",
          contextName: "ctx2",
          passed: false,
        },
      ]);
    });

    it("handles student activity rows where studentSolutionId is null", async () => {
      const activityRow = buildStudentAnalysisRow({ studentSolutionId: null });
      prismaMock.$queryRawTyped.mockResolvedValue([activityRow]);

      const [studentAnalyses] = await service.findCurrentAnalysesWithActivities(
        sessionId,
        taskId,
      );

      expect(studentAnalyses).toHaveLength(1);
      expect(studentAnalyses[0].studentSolutionId).toBeNull();
    });

    it("keeps multiple starred activity solutions for the same student as separate analyses", async () => {
      const firstStarred = buildStudentAnalysisRow({
        studentSolutionId: null,
        isReference: true,
        solutionHash: new Uint8Array([10, 20, 30]),
      });
      const secondStarred = buildStudentAnalysisRow({
        studentSolutionId: null,
        isReference: true,
        solutionHash: new Uint8Array([40, 50, 60]),
      });
      prismaMock.$queryRawTyped.mockResolvedValue([
        firstStarred,
        secondStarred,
      ]);

      const [studentAnalyses] = await service.findCurrentAnalysesWithActivities(
        sessionId,
        taskId,
      );

      expect(studentAnalyses).toHaveLength(2);
      expect(studentAnalyses.map((analysis) => analysis.solutionHash)).toEqual(
        expect.arrayContaining([
          firstStarred.solutionHash,
          secondStarred.solutionHash,
        ]),
      );
    });

    it("merges multiple rows for the same reference solution into one analysis with all tests", async () => {
      const rowWithFirstTest = buildReferenceAnalysisRow({
        testName: "ref1",
        testPassed: true,
        testIdentifier: "ref1",
        testContextName: "ctx1",
      });
      const rowWithSecondTest = buildReferenceAnalysisRow({
        testName: "ref2",
        testPassed: false,
        testIdentifier: "ref2",
        testContextName: "ctx2",
      });
      prismaMock.$queryRawTyped.mockResolvedValue([
        rowWithFirstTest,
        rowWithSecondTest,
      ]);

      const [, referenceAnalyses] =
        await service.findCurrentAnalysesWithActivities(sessionId, taskId);

      expect(referenceAnalyses).toHaveLength(1);
      expect(referenceAnalyses[0].tests).toEqual([
        { identifier: "ref1", name: "ref1", contextName: "ctx1", passed: true },
        {
          identifier: "ref2",
          name: "ref2",
          contextName: "ctx2",
          passed: false,
        },
      ]);
    });

    it("returns both student and reference analyses when both are present", async () => {
      const studentRow = buildStudentAnalysisRow();
      const referenceRow = buildReferenceAnalysisRow();
      prismaMock.$queryRawTyped.mockResolvedValue([studentRow, referenceRow]);

      const [studentAnalyses, referenceAnalyses] =
        await service.findCurrentAnalysesWithActivities(sessionId, taskId);

      expect(studentAnalyses).toHaveLength(1);
      expect(referenceAnalyses).toHaveLength(1);
    });
  });

  describe("updateStudentReferenceSolutions", () => {
    const classId = 3;
    const studentId = 4;
    const firstHash = Buffer.from("first");
    const secondHash = Buffer.from("second");

    it("creates all references in one batch and removes duplicate hashes", async () => {
      prismaMock.solution.findMany.mockResolvedValue([
        buildSolution(firstHash),
        buildSolution(secondHash),
      ]);

      await service.updateStudentReferenceSolutions(
        classId,
        sessionId,
        taskId,
        studentId,
        [firstHash, secondHash, firstHash],
        true,
      );

      expect(
        prismaMock.solutionActivityReference.createMany,
      ).toHaveBeenCalledWith({
        data: [
          { sessionId, taskId, studentId, solutionHash: firstHash },
          { sessionId, taskId, studentId, solutionHash: secondHash },
        ],
        skipDuplicates: true,
      });
    });

    it("removes all requested references in one batch", async () => {
      prismaMock.solution.findMany.mockResolvedValue([
        buildSolution(firstHash),
        buildSolution(secondHash),
      ]);

      await service.updateStudentReferenceSolutions(
        classId,
        sessionId,
        taskId,
        studentId,
        [firstHash, secondHash],
        false,
      );

      expect(
        prismaMock.solutionActivityReference.deleteMany,
      ).toHaveBeenCalledWith({
        where: {
          sessionId,
          taskId,
          studentId,
          solutionHash: { in: [firstHash, secondHash] },
        },
      });
    });

    it("rejects the whole batch when any solution is unavailable", async () => {
      prismaMock.solution.findMany.mockResolvedValue([
        buildSolution(firstHash),
      ]);

      await expect(
        service.updateStudentReferenceSolutions(
          classId,
          sessionId,
          taskId,
          studentId,
          [firstHash, secondHash],
          true,
        ),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(
        prismaMock.solutionActivityReference.createMany,
      ).not.toHaveBeenCalled();
    });
  });
});
