import { ForbiddenException } from "@nestjs/common";
import { User, UserType } from "@prisma/client";
import { AuthorizationService } from "../../authorization/authorization.service";
import { TasksController } from "../tasks.controller";
import { TasksService } from "../tasks.service";

// The rule for which tasks are visible is exercised against the database in
// test/task-visibility-authorization.e2e-spec.ts. Here we only check that the
// three read endpoints refuse when the authorization check says no, which needs
// no database - the AuthorizationService is mocked.
describe("TasksController task-visibility enforcement", () => {
  const taskId = 3;
  const teacher = { id: 11, type: UserType.TEACHER } as User;

  const buildController = (
    canView: boolean,
  ): { controller: TasksController; tasksService: MockTasksService } => {
    const tasksService = {
      findByIdOrThrow: jest.fn().mockResolvedValue({
        id: taskId,
        title: "t",
        description: "d",
        type: "SCRATCH",
        creatorId: 10,
        isPublic: false,
      }),
      findByIdOrThrowWithReferenceSolutions: jest.fn().mockResolvedValue({
        id: taskId,
        title: "t",
        description: "d",
        type: "SCRATCH",
        creatorId: 10,
        isPublic: false,
        referenceSolutions: [],
      }),
      downloadByIdOrThrow: jest
        .fn()
        .mockResolvedValue({ data: Buffer.from(""), mimeType: "text/plain" }),
      isTaskInUse: jest.fn().mockResolvedValue(false),
    };

    const authorizationService = {
      canViewTask: jest.fn().mockResolvedValue(canView),
    };

    const controller = new TasksController(
      tasksService as unknown as TasksService,
      authorizationService as unknown as AuthorizationService,
    );

    return { controller, tasksService };
  };

  it("refuses the task detail when the task is not visible", async () => {
    const { controller, tasksService } = buildController(false);

    await expect(controller.findOne(teacher, null, taskId)).rejects.toThrow(
      ForbiddenException,
    );

    expect(tasksService.findByIdOrThrow).not.toHaveBeenCalled();
  });

  it("refuses the download when the task is not visible", async () => {
    const { controller, tasksService } = buildController(false);

    await expect(controller.downloadOne(teacher, null, taskId)).rejects.toThrow(
      ForbiddenException,
    );

    expect(tasksService.downloadByIdOrThrow).not.toHaveBeenCalled();
  });

  it("refuses the reference solutions when the task is not visible", async () => {
    const { controller, tasksService } = buildController(false);

    await expect(
      controller.findOneWithReferenceSolutions(teacher, taskId),
    ).rejects.toThrow(ForbiddenException);

    expect(
      tasksService.findByIdOrThrowWithReferenceSolutions,
    ).not.toHaveBeenCalled();
  });

  it("serves the task detail when the task is visible", async () => {
    const { controller, tasksService } = buildController(true);

    await expect(
      controller.findOne(teacher, null, taskId),
    ).resolves.toBeDefined();

    expect(tasksService.findByIdOrThrow).toHaveBeenCalled();
  });
});

type MockTasksService = {
  findByIdOrThrow: jest.Mock;
  findByIdOrThrowWithReferenceSolutions: jest.Mock;
  downloadByIdOrThrow: jest.Mock;
  isTaskInUse: jest.Mock;
};
