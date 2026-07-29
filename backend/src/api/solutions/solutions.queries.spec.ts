import { Test, TestingModule } from "@nestjs/testing";
import {
  AstVersion,
  StudentActivity,
  StudentActivityType,
} from "@prisma/client";
import { getCurrentAnalysesWithActivities } from "@prisma/client/sql";
import { CoreModule } from "src/core/core.module";
import { PrismaService } from "src/prisma/prisma.service";
import { mockConfigModule } from "src/utilities/test/mock-config.service";

describe("getCurrentAnalysesWithActivities", () => {
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

  const createStudentActivity = async (
    studentId: number,
    solutionHash: Buffer,
    happenedAt: Date,
    createdAt?: Date,
    isReference = false,
  ): Promise<StudentActivity> => {
    const activity = await prisma.studentActivity.create({
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

    if (isReference) {
      await prisma.solutionActivityReference.create({
        data: {
          solutionHash,
          studentId,
          sessionId,
          taskId,
        },
      });
    }

    return activity;
  };

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

  it("returns a starred activity as a showcase row with isReference=true and no studentSolutionId", async () => {
    const student = await createStudent();
    const hash = Buffer.from("hash-starred-act");

    await createSolution(hash);
    await createAnalysis(hash);
    await createStudentActivity(student.id, hash, new Date(), undefined, true);

    const rows = await prisma.$queryRawTyped(
      getCurrentAnalysesWithActivities(sessionId, taskId),
    );

    const match = rows.find((r) => r.studentId === student.id && r.isReference);
    expect(match).toBeDefined();
    expect(match!.studentSolutionId).toBeNull();
    expect(match!.isReference).toBe(true);
  });

  it("returns the latest solution once and a different past starred solution", async () => {
    const student = await createStudent();
    const pastHash = Buffer.from("hash-past-starred");
    const latestHash = Buffer.from("hash-latest");
    const earlier = new Date("2026-05-26T13:33:00.000Z");
    const later = new Date("2026-05-26T15:33:00.000Z");

    await createSolution(pastHash);
    await createAnalysis(pastHash);
    await createStudentActivity(student.id, pastHash, earlier, earlier, true);

    await createSolution(latestHash);
    await createAnalysis(latestHash);
    await createStudentActivity(student.id, latestHash, later, later);

    const rows = await prisma.$queryRawTyped(
      getCurrentAnalysesWithActivities(sessionId, taskId),
    );

    const studentRows = rows
      .filter((row) => row.studentId === student.id)
      .map((row) => ({
        solutionHash: Buffer.from(row.solutionHash!).toString(),
        isLatest: row.isLatest,
        isReference: row.isReference,
        studentSolutionId: row.studentSolutionId,
      }))
      .sort((left, right) =>
        left.solutionHash.localeCompare(right.solutionHash),
      );

    expect(studentRows).toEqual([
      {
        solutionHash: "hash-latest",
        isLatest: true,
        isReference: false,
        studentSolutionId: null,
      },
      {
        solutionHash: "hash-past-starred",
        isLatest: false,
        isReference: true,
        studentSolutionId: null,
      },
    ]);
  });
});
