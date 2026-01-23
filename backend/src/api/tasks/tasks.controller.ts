import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  StreamableFile,
  UploadedFiles,
  UseInterceptors,
} from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiConsumes,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from "@nestjs/swagger";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import "multer";
import { User, UserType } from "@prisma/client";
import { JsonToObjectsInterceptor } from "src/utilities/json-to-object-interceptor";
import { fromQueryResults } from "../helpers";
import { AuthenticatedUser } from "../authentication/authenticated-user.decorator";
import { AuthorizationService } from "../authorization/authorization.service";
import { NonUserRoles, Roles } from "../authentication/role.decorator";
import {
  CreateTaskDto,
  ExistingTaskDto,
  UpdateTaskDto,
  DeletedTaskDto,
  TaskId,
} from "./dto";
import { TaskInUseError, TasksService } from "./tasks.service";
import { ExistingTaskWithReferenceSolutionsDto } from "./dto/existing-task-with-reference-solutions.dto";

@Controller("tasks")
@ApiTags("tasks")
export class TasksController {
  constructor(
    private readonly tasksService: TasksService,
    private readonly authorizationService: AuthorizationService,
  ) {}

  @Post()
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    type: CreateTaskDto,
    description: "The task to create",
  })
  @ApiCreatedResponse({ type: ExistingTaskDto })
  @ApiForbiddenResponse()
  @ApiBadRequestResponse()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: "taskFile", maxCount: 1 },
      { name: "referenceSolutionsFiles" },
    ]),
    JsonToObjectsInterceptor(["referenceSolutions"]),
  )
  async create(
    @AuthenticatedUser() user: User,
    @Body() createTaskDto: CreateTaskDto,
    @UploadedFiles()
    files: {
      taskFile?: Express.Multer.File[];
      referenceSolutionsFiles?: Express.Multer.File[];
    },
  ): Promise<ExistingTaskDto> {
    const { referenceSolutions, ...rest } = createTaskDto;

    const referenceSolutionsFiles = files.referenceSolutionsFiles || [];
    const taskFile = files.taskFile?.[0];

    if (!taskFile) {
      throw new BadRequestException("Task file is required");
    }

    if (referenceSolutions.filter((s) => s.isInitial).length !== 1) {
      throw new BadRequestException(
        "There must be exactly one initial solution",
      );
    }

    if (referenceSolutions.length !== referenceSolutionsFiles.length) {
      throw new BadRequestException(
        "The number of reference solutions must match the number of files",
      );
    }

    const task = await this.tasksService.create(
      {
        ...rest,
        creatorId: user.id,
      },
      taskFile.mimetype,
      taskFile.buffer,
      referenceSolutions,
      referenceSolutionsFiles,
    );

    return ExistingTaskDto.fromQueryResult(task);
  }

  @Get()
  @Roles([UserType.ADMIN, UserType.TEACHER, NonUserRoles.STUDENT])
  @ApiOkResponse({ type: ExistingTaskDto, isArray: true })
  async findAll(
    @AuthenticatedUser() user: User,
    @Query("includeSoftDelete", new ParseBoolPipe({ optional: true }))
    includeSoftDelete?: boolean,
  ): Promise<ExistingTaskDto[]> {
    // TODO: add pagination support

    const canIncludeSoftDelete =
      user.type === UserType.ADMIN ||
      (user.type === UserType.TEACHER && includeSoftDelete);

    const tasks = await this.tasksService.findMany({}, canIncludeSoftDelete);
    return fromQueryResults(ExistingTaskDto, tasks);
  }

  @Get(":id")
  @Roles([UserType.ADMIN, UserType.TEACHER, NonUserRoles.STUDENT])
  @ApiOkResponse({ type: ExistingTaskDto })
  @ApiForbiddenResponse()
  @ApiNotFoundResponse()
  async findOne(
    @AuthenticatedUser() user: User,
    @Param("id", ParseIntPipe) id: TaskId,
    @Query("includeSoftDelete", new ParseBoolPipe({ optional: true }))
    includeSoftDelete?: boolean,
  ): Promise<ExistingTaskDto> {
    const canIncludeSoftDelete =
      user.type === UserType.ADMIN ||
      (user.type === UserType.TEACHER && includeSoftDelete);

    const task = await this.tasksService.findByIdOrThrow(
      id,
      canIncludeSoftDelete,
    );
    return ExistingTaskDto.fromQueryResult(task);
  }

  @Get(":id/with-reference-solutions")
  @ApiOkResponse({ type: ExistingTaskWithReferenceSolutionsDto })
  @ApiForbiddenResponse()
  @ApiNotFoundResponse()
  async findOneWithReferenceSolutions(
    @Param("id", ParseIntPipe) id: TaskId,
    @Query("includeSoftDelete", new ParseBoolPipe({ optional: true }))
    includeSoftDelete?: boolean,
  ): Promise<ExistingTaskWithReferenceSolutionsDto> {
    const [task, isInUse] = await Promise.all([
      this.tasksService.findByIdOrThrowWithReferenceSolutions(
        id,
        includeSoftDelete,
      ),
      this.tasksService.isTaskInUse(id),
    ]);

    // workaround for bug where class-transformer loses the Uint8Array type
    // see https://github.com/typestack/class-transformer/issues/1815
    // Buffers do not seem to be affected by this bug
    task.referenceSolutions.forEach(
      (solution) =>
        (solution.solution.data = Buffer.from(solution.solution.data)),
    );

    return ExistingTaskWithReferenceSolutionsDto.fromQueryResult({
      ...task,
      isInUse,
    });
  }

  @Get(":id/download")
  @Roles([UserType.ADMIN, UserType.TEACHER, NonUserRoles.STUDENT])
  @ApiOkResponse(/*??*/)
  @ApiForbiddenResponse()
  @ApiNotFoundResponse()
  async downloadOne(
    @AuthenticatedUser() user: User,
    @Param("id", ParseIntPipe) id: TaskId,
    @Query("includeSoftDelete", new ParseBoolPipe({ optional: true }))
    includeSoftDelete?: boolean,
  ): Promise<StreamableFile> {
    const canIncludeSoftDelete =
      user.type === UserType.ADMIN ||
      (user.type === UserType.TEACHER && includeSoftDelete);

    const task = await this.tasksService.downloadByIdOrThrow(
      id,
      canIncludeSoftDelete,
    );
    return new StreamableFile(task.data, {
      type: task.mimeType,
    });
  }

  @Patch(":id")
  @ApiConsumes("multipart/form-data")
  @ApiCreatedResponse({ type: ExistingTaskDto })
  @ApiForbiddenResponse()
  @ApiNotFoundResponse()
  @ApiConflictResponse({
    description: "Task is in use by one or more classes and cannot be modified",
  })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: "taskFile", maxCount: 1 },
      { name: "referenceSolutionsFiles" },
    ]),
    JsonToObjectsInterceptor(["referenceSolutions"]),
  )
  async update(
    @AuthenticatedUser() user: User,
    @Param("id", ParseIntPipe) id: TaskId,
    @Body() updateTaskDto: UpdateTaskDto,
    @UploadedFiles()
    files: {
      taskFile?: Express.Multer.File[];
      referenceSolutionsFiles?: Express.Multer.File[];
    },
    @Query("includeSoftDelete", new ParseBoolPipe({ optional: true }))
    includeSoftDelete?: boolean,
  ): Promise<ExistingTaskDto> {
    const isAuthorized = await this.authorizationService.canUpdateTask(
      user,
      id,
    );

    if (!isAuthorized) {
      throw new ForbiddenException();
    }

    const referenceSolutionsFiles = files.referenceSolutionsFiles || [];
    const taskFile = files.taskFile?.[0];

    if (taskFile === undefined) {
      throw new BadRequestException("Task file is required");
    }

    const { referenceSolutions, ...rest } = updateTaskDto;

    if (referenceSolutions.length !== referenceSolutionsFiles.length) {
      throw new BadRequestException(
        "The number of reference solutions must match the number of files",
      );
    }

    try {
      const task = await this.tasksService.update(
        id,
        rest,
        taskFile.mimetype,
        taskFile.buffer,
        referenceSolutions,
        referenceSolutionsFiles,
        includeSoftDelete,
      );

      return ExistingTaskDto.fromQueryResult(task);
    } catch (error) {
      if (error instanceof TaskInUseError) {
        throw new ConflictException(error.message);
      }
      throw error;
    }
  }

  @Delete(":id")
  @ApiOkResponse({ type: DeletedTaskDto })
  @ApiForbiddenResponse()
  @ApiNotFoundResponse()
  @ApiConflictResponse({
    description: "Task is in use by one or more classes and cannot be deleted",
  })
  async remove(
    @AuthenticatedUser() user: User,
    @Param("id", ParseIntPipe) id: TaskId,
    @Query("includeSoftDelete", new ParseBoolPipe({ optional: true }))
    includeSoftDelete?: boolean,
  ): Promise<DeletedTaskDto> {
    const isAuthorized = await this.authorizationService.canDeleteTask(
      user,
      id,
      includeSoftDelete,
    );

    if (!isAuthorized) {
      throw new ForbiddenException();
    }

    try {
      const task = await this.tasksService.deleteById(id);
      return DeletedTaskDto.fromQueryResult(task);
    } catch (error) {
      if (error instanceof TaskInUseError) {
        throw new ConflictException(error.message);
      }
      throw error;
    }
  }
}
