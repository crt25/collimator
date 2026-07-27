import { ConflictException } from "@nestjs/common";
import { TaskType, User, UserType } from "@prisma/client";
import { AuthorizationService } from "../authorization/authorization.service";
import { ErrorCode } from "../exceptions/error-codes";
import { UpdateTaskDto } from "./dto";
import { TasksController } from "./tasks.controller";
import { TaskInOtherUsersLessonError, TasksService } from "./tasks.service";

describe("TasksController.update", () => {
  it("maps a task used by another user's lesson to the exact conflict response", async () => {
    const tasksService = {
      update: jest.fn().mockRejectedValue(new TaskInOtherUsersLessonError()),
    } as unknown as TasksService;

    const authorizationService = {
      canUpdateTask: jest.fn().mockResolvedValue(true),
    } as unknown as AuthorizationService;

    const controller = new TasksController(tasksService, authorizationService);

    const user = { id: 7, type: UserType.TEACHER } as User;

    const updateTaskDto = {
      title: "rewritten",
      description: "new",
      type: TaskType.SCRATCH,
      isPublic: false,
      referenceSolutions: [],
    } as unknown as UpdateTaskDto;

    const taskFile = {
      mimetype: "application/json",
      buffer: Buffer.from([1, 2, 3]),
    } as Express.Multer.File;

    let thrown: unknown;

    try {
      await controller.update(
        user,
        1,
        updateTaskDto,
        { taskFile: [taskFile], referenceSolutionsFiles: [] },
        false,
      );
    } catch (error) {
      thrown = error;
    }

    expect(thrown).toBeInstanceOf(ConflictException);

    const conflict = thrown as ConflictException;

    expect(conflict.getStatus()).toBe(409);

    expect(conflict.getResponse()).toEqual({
      errorCode: ErrorCode.TASK_IN_OTHER_USERS_LESSON,
    });

    expect(authorizationService.canUpdateTask).toHaveBeenCalledWith(user, 1);

    expect(tasksService.update).toHaveBeenCalledWith(
      1,
      {
        title: "rewritten",
        description: "new",
        type: TaskType.SCRATCH,
        isPublic: false,
      },
      "application/json",
      taskFile.buffer,
      [],
      [],
      false,
    );
  });
});
