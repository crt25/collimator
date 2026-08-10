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
        happenedAt: createdAt ?? new Date(),
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
      getCurrentAnalysesWithActivities(sessionId, taskId, false, false),
    );

    expect(
      rows
        .filter((row) => row.studentId === student.id)
        .map((row) => ({
          hash: Buffer.from(row.solutionHash!).toString(),
          studentSolutionId: row.studentSolutionId,
          isStudentSolution: row.isStudentSolution,
          isLatest: row.isLatest,
          isReference: row.isReference,
        })),
    ).toEqual([
      {
        hash: "hash",
        studentSolutionId: null,
        isStudentSolution: false,
        isLatest: true,
        isReference: false,
      },
    ]);
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
      getCurrentAnalysesWithActivities(sessionId, taskId, false, false),
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
    const submission = await createStudentSolution(
      student.id,
      submissionHash,
      earlier,
    );

    await createSolution(activityHash);
    await createStudentActivity(student.id, activityHash, later, later);

    const rows = await prisma.$queryRawTyped(
      getCurrentAnalysesWithActivities(sessionId, taskId, false, false),
    );

    expect(
      rows
        .filter((row) => row.studentId === student.id)
        .map((row) => ({
          hash: Buffer.from(row.solutionHash!).toString(),
          studentSolutionId: row.studentSolutionId,
          isStudentSolution: row.isStudentSolution,
          isLatest: row.isLatest,
        })),
    ).toEqual([
      {
        hash: "hash-sub2",
        studentSolutionId: submission.id,
        isStudentSolution: true,
        isLatest: true,
      },
    ]);
  });

  it("does not return a student when neither their submission nor their activity has been analysed", async () => {
    const student = await createStudent();
    const hash = Buffer.from("hash-analysis");

    await createSolution(hash);
    await createStudentActivity(student.id, hash, new Date());

    const rows = await prisma.$queryRawTyped(
      getCurrentAnalysesWithActivities(sessionId, taskId, false, false),
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
      getCurrentAnalysesWithActivities(sessionId, taskId, false, false),
    );

    expect(
      rows
        .filter((row) => row.referenceSolutionId !== null)
        .map((row) => ({
          hash: Buffer.from(row.solutionHash!).toString(),
          isReference: row.isReference,
          isLatest: row.isLatest,
          studentId: row.studentId,
          title: row.referenceSolutionTitle,
        })),
    ).toEqual([
      {
        hash: "hash-ref2",
        isReference: true,
        isLatest: false,
        studentId: null,
        title: "Ref",
      },
    ]);
  });

  it("returns a starred activity as a showcase row with isReference=true and no studentSolutionId", async () => {
    const student = await createStudent();
    const hash = Buffer.from("hash-starred-act");

    await createSolution(hash);
    await createAnalysis(hash);
    await createStudentActivity(student.id, hash, new Date(), undefined, true);

    const rows = await prisma.$queryRawTyped(
      getCurrentAnalysesWithActivities(sessionId, taskId, false, false),
    );

    expect(
      rows
        .filter((row) => row.studentId === student.id)
        .map((row) => ({
          hash: Buffer.from(row.solutionHash!).toString(),
          studentSolutionId: row.studentSolutionId,
          isReference: row.isReference,
          isLatest: row.isLatest,
        })),
    ).toEqual([
      {
        hash: "hash-starred-act",
        studentSolutionId: null,
        isReference: true,
        isLatest: true,
      },
    ]);
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
      getCurrentAnalysesWithActivities(sessionId, taskId, false, false),
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

  describe("getCurrentAnalysesWithActivities with studentSolutionsOnly = true", () => {
    it("shows the latest submitted solution and its tests, ignoring a newer activity", async () => {
      const student = await createStudent();
      const submissionHash = Buffer.from("sso-sub");
      const activityHash = Buffer.from("sso-act");
      const earlier = new Date("2026-05-26T13:33:00.000Z");
      const later = new Date("2026-05-26T15:33:00.000Z");

      await createSolution(submissionHash);
      await createAnalysis(submissionHash);
      const submission = await createStudentSolution(
        student.id,
        submissionHash,
        earlier,
      );
      await prisma.solutionTest.create({
        data: {
          studentSolutionId: submission.id,
          name: "test-a",
          passed: true,
        },
      });

      // a newer, analysed activity snapshot must NOT shadow the submission
      await createSolution(activityHash);
      await createAnalysis(activityHash);
      await createStudentActivity(student.id, activityHash, later, later);

      const rows = await prisma.$queryRawTyped(
        getCurrentAnalysesWithActivities(sessionId, taskId, true, false),
      );

      const studentRows = rows.filter((row) => row.studentId === student.id);
      expect(studentRows).toHaveLength(1);
      expect(studentRows[0].studentSolutionId).toBe(submission.id);
      expect(studentRows[0].isStudentSolution).toBe(true);
      expect(Buffer.from(studentRows[0].solutionHash!).toString()).toBe(
        "sso-sub",
      );
      expect(studentRows[0].testName).toBe("test-a");
      expect(studentRows[0].testPassed).toBe(true);
    });

    it("shows a submitted solution even when it has no tests", async () => {
      const student = await createStudent();
      const hash = Buffer.from("sso-notest");

      await createSolution(hash);
      await createAnalysis(hash);
      const submission = await createStudentSolution(student.id, hash);

      const rows = await prisma.$queryRawTyped(
        getCurrentAnalysesWithActivities(sessionId, taskId, true, false),
      );

      const studentRows = rows.filter((row) => row.studentId === student.id);
      expect(studentRows).toHaveLength(1);
      expect(studentRows[0].studentSolutionId).toBe(submission.id);
      expect(studentRows[0].testName).toBeNull();
    });

    it("does not return a student who only has activities", async () => {
      const student = await createStudent();
      const hash = Buffer.from("sso-onlyact");

      await createSolution(hash);
      await createAnalysis(hash);
      await createStudentActivity(student.id, hash, new Date());

      const rows = await prisma.$queryRawTyped(
        getCurrentAnalysesWithActivities(sessionId, taskId, true, false),
      );

      expect(rows.find((row) => row.studentId === student.id)).toBeUndefined();
    });

    it("returns a starred past submission alongside the latest submission", async () => {
      const student = await createStudent();
      const pastHash = Buffer.from("sso-past-starred");
      const latestHash = Buffer.from("sso-latest");
      const earlier = new Date("2026-05-26T13:33:00.000Z");
      const later = new Date("2026-05-26T15:33:00.000Z");

      await createSolution(pastHash);
      await createAnalysis(pastHash);
      const pastSubmission = await createStudentSolution(
        student.id,
        pastHash,
        earlier,
      );
      await prisma.solutionActivityReference.create({
        data: {
          solutionHash: pastHash,
          studentId: student.id,
          sessionId,
          taskId,
        },
      });

      await createSolution(latestHash);
      await createAnalysis(latestHash);
      const latestSubmission = await createStudentSolution(
        student.id,
        latestHash,
        later,
      );

      const rows = await prisma.$queryRawTyped(
        getCurrentAnalysesWithActivities(sessionId, taskId, true, false),
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
          solutionHash: "sso-latest",
          isLatest: true,
          isReference: false,
          studentSolutionId: latestSubmission.id,
        },
        {
          solutionHash: "sso-past-starred",
          isLatest: false,
          isReference: true,
          studentSolutionId: pastSubmission.id,
        },
      ]);
    });

    it("excludes a starred solution that is only an activity", async () => {
      const student = await createStudent();
      const hash = Buffer.from("sso-starred-act");

      await createSolution(hash);
      await createAnalysis(hash);
      // starred, but backed only by an activity (no StudentSolution)
      await createStudentActivity(
        student.id,
        hash,
        new Date(),
        undefined,
        true,
      );

      // it would show up in the activity-inclusive query...
      const withActivities = await prisma.$queryRawTyped(
        getCurrentAnalysesWithActivities(sessionId, taskId, false, false),
      );
      expect(
        withActivities.find((row) => row.studentId === student.id),
      ).toBeDefined();

      // ...but not in submitted-only mode
      const submittedOnly = await prisma.$queryRawTyped(
        getCurrentAnalysesWithActivities(sessionId, taskId, true, false),
      );
      expect(
        submittedOnly.find((row) => row.studentId === student.id),
      ).toBeUndefined();
    });

    it("returns task reference solutions", async () => {
      const hash = Buffer.from("sso-ref");

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
        getCurrentAnalysesWithActivities(sessionId, taskId, true, false),
      );

      expect(
        rows
          .filter((row) => row.referenceSolutionId !== null)
          .map((row) => row.referenceSolutionTitle),
      ).toEqual(["Ref"]);
    });
  });

  describe("getCurrentAnalysesWithActivities with ignoreStarredSolutions = true", () => {
    it("drops a past starred submission but keeps the latest", async () => {
      const student = await createStudent();
      const pastHash = Buffer.from("igs-past-starred");
      const latestHash = Buffer.from("igs-latest");
      const earlier = new Date("2026-05-26T13:33:00.000Z");
      const later = new Date("2026-05-26T15:33:00.000Z");

      await createSolution(pastHash);
      await createAnalysis(pastHash);
      await createStudentSolution(student.id, pastHash, earlier);
      await prisma.solutionActivityReference.create({
        data: {
          solutionHash: pastHash,
          studentId: student.id,
          sessionId,
          taskId,
        },
      });

      await createSolution(latestHash);
      await createAnalysis(latestHash);
      const latestSubmission = await createStudentSolution(
        student.id,
        latestHash,
        later,
      );

      const rows = await prisma.$queryRawTyped(
        getCurrentAnalysesWithActivities(sessionId, taskId, true, true),
      );

      const studentRows = rows.filter((row) => row.studentId === student.id);
      expect(studentRows).toHaveLength(1);
      expect(Buffer.from(studentRows[0].solutionHash!).toString()).toBe(
        "igs-latest",
      );
      expect(studentRows[0].studentSolutionId).toBe(latestSubmission.id);
      expect(studentRows[0].isLatest).toBe(true);
    });

    it("keeps the latest solution even when it is starred", async () => {
      const student = await createStudent();
      const hash = Buffer.from("igs-latest-starred");

      await createSolution(hash);
      await createAnalysis(hash);
      const submission = await createStudentSolution(student.id, hash);
      await prisma.solutionActivityReference.create({
        data: { solutionHash: hash, studentId: student.id, sessionId, taskId },
      });

      const rows = await prisma.$queryRawTyped(
        getCurrentAnalysesWithActivities(sessionId, taskId, true, true),
      );

      const studentRows = rows.filter((row) => row.studentId === student.id);
      expect(studentRows).toHaveLength(1);
      expect(studentRows[0].studentSolutionId).toBe(submission.id);
      expect(studentRows[0].isLatest).toBe(true);
      expect(studentRows[0].isReference).toBe(true);
    });

    it("drops a past starred solution independently of studentSolutionsOnly", async () => {
      const student = await createStudent();
      const pastHash = Buffer.from("igs-past-act");
      const latestHash = Buffer.from("igs-latest-act");
      const earlier = new Date("2026-05-26T13:33:00.000Z");
      const later = new Date("2026-05-26T15:33:00.000Z");

      await createSolution(pastHash);
      await createAnalysis(pastHash);
      await createStudentActivity(student.id, pastHash, earlier, earlier, true);

      await createSolution(latestHash);
      await createAnalysis(latestHash);
      await createStudentActivity(student.id, latestHash, later, later);

      const rows = await prisma.$queryRawTyped(
        getCurrentAnalysesWithActivities(sessionId, taskId, false, true),
      );

      const studentRows = rows
        .filter((row) => row.studentId === student.id)
        .map((row) => Buffer.from(row.solutionHash!).toString());
      expect(studentRows).toEqual(["igs-latest-act"]);
    });
  });
});
