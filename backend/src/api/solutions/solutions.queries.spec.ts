import { Test, TestingModule } from "@nestjs/testing";
import { AstVersion, StudentActivityType } from "@prisma/client";
import {
  getCurrentAnalyses,
  getCurrentAnalysesWithActivities,
} from "@prisma/client/sql";
import { CoreModule } from "src/core/core.module";
import { PrismaService } from "src/prisma/prisma.service";
import { mockConfigModule } from "src/utilities/test/mock-config.service";

describe("getCurrentAnalyses and getCurrentAnalysesWithActivities", () => {
  let prisma: PrismaService;
  let module: TestingModule;
  let taskId: number;
  let sessionId: number;

  beforeEach(async () => {
    const suffix = Math.random().toString(36).slice(2);

    module = await Test.createTestingModule({
      imports: [CoreModule, mockConfigModule],
    }).compile();

    prisma = module.get<PrismaService>(PrismaService);

    const task = await prisma.task.create({
      data: {
        title: `Task ${suffix}`,
        description: "",
        type: "SCRATCH",
        data: Buffer.from("data"),
        mimeType: "application/octet-stream",
      },
    });
    taskId = task.id;

    const user = await prisma.user.create({
      data: {
        email: `teacher-${suffix}@test.com`,
        authenticationProvider: "MICROSOFT",
        type: "TEACHER",
      },
    });

    const cls = await prisma.class.create({
      data: { name: `Class ${suffix}`, teacherId: user.id },
    });

    const session = await prisma.session.create({
      data: { title: `Session ${suffix}`, description: "", classId: cls.id },
    });
    sessionId = session.id;

    await prisma.sessionTask.create({ data: { sessionId, taskId, index: 0 } });
  });

  afterEach(() => module.close());

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const createStudent = () => prisma.student.create({ data: {} });

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const createSolution = (hash: Buffer) =>
    prisma.solution.create({
      data: {
        taskId,
        hash,
        data: Buffer.from("solution"),
        mimeType: "application/octet-stream",
      },
    });

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const createAnalysis = (solutionHash: Buffer) =>
    prisma.solutionAnalysis.create({
      data: {
        taskId,
        solutionHash,
        genericAst: "{}",
        astVersion: AstVersion.v1,
      },
    });

  const createStudentSolution = (
    studentId: number,
    solutionHash: Buffer,
    createdAt?: Date,
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  ) =>
    prisma.studentSolution.create({
      data: {
        taskId,
        solutionHash,
        studentId,
        sessionId,
        ...(createdAt && { createdAt }),
      },
    });

  const createStudentActivity = (
    studentId: number,
    solutionHash: Buffer,
    happenedAt: Date,
    createdAt?: Date,
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  ) =>
    prisma.studentActivity.create({
      data: {
        type: StudentActivityType.TASK_RUN_SOLUTION,
        happenedAt,
        studentId,
        sessionId,
        taskId,
        solutionHash,
        ...(createdAt && { createdAt }),
      },
    });

  describe("getCurrentAnalyses", () => {
    it("returns a student whose StudentSolution has been analysed", async () => {
      const student = await createStudent();
      const hash = Buffer.from("hash");

      await createSolution(hash);
      await createAnalysis(hash);
      await createStudentSolution(student.id, hash);

      const rows = await prisma.$queryRawTyped(
        getCurrentAnalyses(sessionId, taskId),
      );

      const match = rows.find((r) => r.studentId === student.id);
      expect(match).toBeDefined();
      expect(match!.studentSolutionId).not.toBeNull();
    });

    it("does not return a student whose submitted solution has not yet been analysed", async () => {
      const student = await createStudent();
      const hash = Buffer.from("hash-c");

      await createSolution(hash);
      await createStudentSolution(student.id, hash);

      const storedSolution = await prisma.studentSolution.findFirst({
        where: { studentId: student.id, taskId, sessionId },
      });
      expect(storedSolution).not.toBeNull();

      const rows = await prisma.$queryRawTyped(
        getCurrentAnalyses(sessionId, taskId),
      );

      expect(rows.find((r) => r.studentId === student.id)).toBeUndefined();
    });

    it("returns the most recent analysed StudentSolution when a student has submitted multiple solutions", async () => {
      const student = await createStudent();
      const olderHash = Buffer.from("hash-older");
      const newerHash = Buffer.from("hash-newer");
      const earlier = new Date("2026-05-26T13:33:00.000Z");
      const later = new Date("2026-05-26T15:33:00.000Z");

      await createSolution(olderHash);
      await createAnalysis(olderHash);
      await createStudentSolution(student.id, olderHash, earlier);

      await createSolution(newerHash);
      await createAnalysis(newerHash);
      await createStudentSolution(student.id, newerHash, later);

      const rows = await prisma.$queryRawTyped(
        getCurrentAnalyses(sessionId, taskId),
      );

      const studentRows = rows.filter((r) => r.studentId === student.id);
      expect(studentRows).toHaveLength(1);
      expect(Buffer.from(studentRows[0].solutionHash!).equals(newerHash)).toBe(
        true,
      );
    });

    it("returns task reference solutions", async () => {
      const hash = Buffer.from("hash-ref");

      await createSolution(hash);
      await createAnalysis(hash);
      await prisma.referenceSolution.create({
        data: {
          title: "Ref",
          description: "Reference",
          isInitial: false,
          taskId,
          solutionHash: hash,
        },
      });

      const rows = await prisma.$queryRawTyped(
        getCurrentAnalyses(sessionId, taskId),
      );

      expect(rows.some((r) => r.referenceSolutionId !== null)).toBe(true);
    });
  });

  describe("getCurrentAnalysesWithActivities", () => {
    it("returns a student whose only analysed solution came from StudentActivity", async () => {
      const student = await createStudent();
      const hash = Buffer.from("hash");

      await createSolution(hash);
      await createAnalysis(hash);
      await createStudentActivity(student.id, hash, new Date());

      const rows = await prisma.$queryRawTyped(
        getCurrentAnalysesWithActivities(sessionId, taskId),
      );

      const match = rows.find((r) => r.studentId === student.id);
      expect(match).toBeDefined();
      expect(match!.studentSolutionId).toBeNull();
    });

    it("shows the activity solution when it is more recent than the StudentSolution and both are analysed", async () => {
      const student = await createStudent();
      const submissionHash = Buffer.from("hash-sub");
      const activityHash = Buffer.from("hash-act");
      const earlier = new Date("2026-05-26T13:33:00.000Z");
      const later = new Date("2026-05-26T15:33:00.000Z");

      await createSolution(submissionHash);
      await createAnalysis(submissionHash);
      await createStudentSolution(student.id, submissionHash, earlier);

      await createSolution(activityHash);
      await createAnalysis(activityHash);
      await createStudentActivity(student.id, activityHash, later, later);

      const submissionRows = await prisma.$queryRawTyped(
        getCurrentAnalyses(sessionId, taskId),
      );
      const submissionMatch = submissionRows.find(
        (r) => r.studentId === student.id,
      );
      expect(submissionMatch).toBeDefined();
      expect(submissionMatch!.studentSolutionId).not.toBeNull();

      const rows = await prisma.$queryRawTyped(
        getCurrentAnalysesWithActivities(sessionId, taskId),
      );

      const studentRows = rows.filter((r) => r.studentId === student.id);
      expect(studentRows).toHaveLength(1);
      expect(studentRows[0].studentSolutionId).toBeNull();
    });

    it("falls back to the StudentSolution when the newer activity solution has not been analysed", async () => {
      const student = await createStudent();
      const submissionHash = Buffer.from("hash-sub2");
      const activityHash = Buffer.from("hash-act2");
      const earlier = new Date("2026-05-26T13:33:00.000Z");
      const later = new Date("2026-05-26T15:33:00.000Z");

      await createSolution(submissionHash);
      await createAnalysis(submissionHash);
      await createStudentSolution(student.id, submissionHash, earlier);

      await createSolution(activityHash);
      await createStudentActivity(student.id, activityHash, later, later);

      const storedActivity = await prisma.studentActivity.findFirst({
        where: { studentId: student.id, solutionHash: activityHash, taskId },
      });
      expect(storedActivity).not.toBeNull();

      const rows = await prisma.$queryRawTyped(
        getCurrentAnalysesWithActivities(sessionId, taskId),
      );

      const studentRows = rows.filter((r) => r.studentId === student.id);
      expect(studentRows).toHaveLength(1);
      expect(studentRows[0].studentSolutionId).not.toBeNull();
    });

    it("does not return a student when neither their submission nor their activity has been analysed", async () => {
      const student = await createStudent();
      const hash = Buffer.from("hash-analysis");

      await createSolution(hash);
      await createStudentActivity(student.id, hash, new Date());

      const storedActivity = await prisma.studentActivity.findFirst({
        where: { studentId: student.id, solutionHash: hash, taskId },
      });
      expect(storedActivity).not.toBeNull();

      const rows = await prisma.$queryRawTyped(
        getCurrentAnalysesWithActivities(sessionId, taskId),
      );

      expect(rows.find((r) => r.studentId === student.id)).toBeUndefined();
    });

    it("returns task reference solutions", async () => {
      const hash = Buffer.from("hash-ref2");

      await createSolution(hash);
      await createAnalysis(hash);
      await prisma.referenceSolution.create({
        data: {
          title: "Ref",
          description: "Reference",
          isInitial: false,
          taskId,
          solutionHash: hash,
        },
      });

      const rows = await prisma.$queryRawTyped(
        getCurrentAnalysesWithActivities(sessionId, taskId),
      );

      expect(rows.some((r) => r.referenceSolutionId !== null)).toBe(true);
    });
  });
});
