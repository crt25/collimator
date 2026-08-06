import {
  AstVersion,
  Prisma,
  Solution,
  Student,
  StudentActivityType,
} from "@prisma/client";
import { ConflictException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { TasksService } from "../tasks/tasks.service";
import { SolutionAnalysisService } from "../solutions/solution-analysis.service";
import {
  SolutionInput,
  StudentActivityInput,
  StudentActivityService,
  StudentActivityWithSolution,
} from "./student-activity.service";

describe("StudentActivityService", () => {
  const student: Student = { id: 1, deletedAt: null };
  const happenedAt = new Date("2026-08-05T08:00:00.000Z");
  const solutionHash = Buffer.from("solution-hash");
  const solutionInput: SolutionInput = {
    data: Buffer.from("submitted solution"),
    mimeType: "application/json",
  };

  const activity: StudentActivityInput = {
    type: StudentActivityType.TASK_RUN_SOLUTION,
    happenedAt,
    happenedAtCounter: 3,
    sessionId: 2,
    taskId: 4,
    appActivity: null,
  };

  const storedSolution: Solution = {
    taskId: activity.taskId,
    hash: solutionHash,
    data: Buffer.from("stored solution"),
    mimeType: solutionInput.mimeType,
    failedAnalyses: 0,
    deletedAt: null,
  };

  const storedActivity: StudentActivityWithSolution = {
    id: 5,
    createdAt: new Date("2026-08-05T08:00:01.000Z"),
    type: activity.type,
    happenedAt,
    happenedAtCounter: activity.happenedAtCounter,
    deletedAt: null,
    studentId: student.id,
    sessionId: activity.sessionId,
    taskId: activity.taskId,
    solutionHash,
    solution: storedSolution,
    appActivity: null,
  };

  const uniqueConstraintError = (): Prisma.PrismaClientKnownRequestError =>
    new Prisma.PrismaClientKnownRequestError("Unique constraint failed", {
      code: "P2002",
      clientVersion: "6.6.0",
    });

  let createActivity: jest.Mock;
  let findActivity: jest.Mock;
  let performAnalysis: jest.Mock;
  let computeSolutionHash: jest.Mock;
  let service: StudentActivityService;

  beforeEach(() => {
    createActivity = jest.fn();
    findActivity = jest.fn();
    performAnalysis = jest.fn();
    computeSolutionHash = jest.fn().mockReturnValue(solutionHash);

    const prisma = {
      studentActivity: {
        create: createActivity,
        findUnique: findActivity,
      },
    } as unknown as PrismaService;

    const tasksService = {
      computeSolutionHash,
    } as unknown as TasksService;

    const analysisService = {
      performAnalysis,
    } as unknown as SolutionAnalysisService;

    service = new StudentActivityService(prisma, tasksService, analysisService);
  });

  it("returns an existing replay without triggering analysis again", async () => {
    createActivity.mockRejectedValue(uniqueConstraintError());
    findActivity.mockResolvedValue(storedActivity);

    await expect(
      service.create(student, activity, solutionInput),
    ).resolves.toBe(storedActivity);

    expect(createActivity).toHaveBeenCalledTimes(1);

    expect(findActivity).toHaveBeenCalledWith({
      where: {
        uniqueStudentActivityPerTypeAndTime: {
          studentId: student.id,
          type: activity.type,
          happenedAt: activity.happenedAt,
          happenedAtCounter: activity.happenedAtCounter,
        },
      },
      include: { appActivity: true, solution: true },
    });

    expect(performAnalysis).not.toHaveBeenCalled();
  });

  it.each([
    {
      name: "session",
      replayActivity: { ...activity, sessionId: activity.sessionId + 1 },
      replaySolution: solutionInput,
      replayHash: solutionHash,
      existingActivity: storedActivity,
    },
    {
      name: "task",
      replayActivity: { ...activity, taskId: activity.taskId + 1 },
      replaySolution: solutionInput,
      replayHash: solutionHash,
      existingActivity: storedActivity,
    },
    {
      name: "solution",
      replayActivity: activity,
      replaySolution: {
        ...solutionInput,
        data: Buffer.from("different solution"),
      },
      replayHash: Buffer.from("different-solution-hash"),
      existingActivity: storedActivity,
    },
    {
      name: "app activity payload",
      replayActivity: {
        ...activity,
        type: StudentActivityType.TASK_APP_ACTIVITY,
        appActivity: { type: "stopAll", data: { source: "button" } },
      },
      replaySolution: solutionInput,
      replayHash: solutionHash,
      existingActivity: {
        ...storedActivity,
        type: StudentActivityType.TASK_APP_ACTIVITY,
        appActivity: {
          id: storedActivity.id,
          type: "greenFlag",
          data: { source: "button" },
        },
      },
    },
  ])("rejects a replay whose $name differs", async (testCase) => {
    createActivity.mockRejectedValue(uniqueConstraintError());
    findActivity.mockResolvedValue(testCase.existingActivity);
    computeSolutionHash.mockReturnValue(testCase.replayHash);

    await expect(
      service.create(student, testCase.replayActivity, testCase.replaySolution),
    ).rejects.toBeInstanceOf(ConflictException);

    expect(createActivity).toHaveBeenCalledTimes(1);
    expect(performAnalysis).not.toHaveBeenCalled();
  });

  it("retries once when concurrent solution creation caused the conflict", async () => {
    createActivity
      .mockRejectedValueOnce(uniqueConstraintError())
      .mockResolvedValueOnce(storedActivity);

    findActivity.mockResolvedValue(null);

    await expect(
      service.create(student, activity, solutionInput),
    ).resolves.toBe(storedActivity);

    expect(createActivity).toHaveBeenCalledTimes(2);
    expect(findActivity).toHaveBeenCalledTimes(1);
    expect(performAnalysis).toHaveBeenCalledWith(storedSolution, AstVersion.v1);
  });

  it("rethrows a persistent unrelated unique conflict after one retry", async () => {
    const error = uniqueConstraintError();

    createActivity.mockRejectedValue(error);
    findActivity.mockResolvedValue(null);

    await expect(service.create(student, activity, solutionInput)).rejects.toBe(
      error,
    );

    expect(createActivity).toHaveBeenCalledTimes(2);
    expect(findActivity).toHaveBeenCalledTimes(2);
    expect(performAnalysis).not.toHaveBeenCalled();
  });
});
