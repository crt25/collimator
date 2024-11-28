import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import {
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from "@nestjs/swagger";
import { FileInterceptor } from "@nestjs/platform-express";
import { Express } from "express";
import "multer";
import {
  CreateTaskDto,
  ExistingTaskDto,
  UpdateTaskDto,
  DeletedTaskDto,
  TaskId,
} from "./dto";
import { TasksService } from "./tasks.service";
import { fromQueryResults } from "../helpers";
import { UpdateTaskFileDto } from "./dto/update-task-file.dto";
import { AuthenticatedUser } from "../authentication/authenticated-user.decorator";
import { User, UserType } from "@prisma/client";
import { AuthorizationService } from "../authorization/authorization.service";
import { NonUserRoles, Roles } from "../authentication/role.decorator";

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
  @UseInterceptors(FileInterceptor("file"))
  async create(
    @AuthenticatedUser() user: User,
    @Body() createTaskDto: CreateTaskDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ExistingTaskDto> {
    const task = await this.tasksService.create(
      {
        ...createTaskDto,
        creatorId: user.id,
      },
      file.mimetype,
      file.buffer,
    );

    return ExistingTaskDto.fromQueryResult(task);
  }

  @Get()
  @Roles([UserType.ADMIN, UserType.TEACHER, NonUserRoles.STUDENT])
  @ApiOkResponse({ type: ExistingTaskDto, isArray: true })
  async findAll(): Promise<ExistingTaskDto[]> {
    // TODO: add pagination support

    const tasks = await this.tasksService.findMany({});
    return fromQueryResults(ExistingTaskDto, tasks);
  }

  @Get(":id")
  @Roles([UserType.ADMIN, UserType.TEACHER, NonUserRoles.STUDENT])
  @ApiOkResponse({ type: ExistingTaskDto })
  @ApiForbiddenResponse()
  @ApiNotFoundResponse()
  async findOne(
    @Param("id", ParseIntPipe) id: TaskId,
  ): Promise<ExistingTaskDto> {
    const task = await this.tasksService.findByIdOrThrow(id);
    return ExistingTaskDto.fromQueryResult(task);
  }

  @Get(":id/download")
  @Roles([UserType.ADMIN, UserType.TEACHER, NonUserRoles.STUDENT])
  @ApiOkResponse(/*??*/)
  @ApiForbiddenResponse()
  @ApiNotFoundResponse()
  async downloadOne(
    @Param("id", ParseIntPipe) id: TaskId,
  ): Promise<StreamableFile> {
    const task = await this.tasksService.downloadByIdOrThrow(id);
    return new StreamableFile(task.data, {
      type: task.mimeType,
    });
  }

  @Patch(":id")
  @ApiCreatedResponse({ type: ExistingTaskDto })
  @ApiForbiddenResponse()
  @ApiNotFoundResponse()
  async update(
    @AuthenticatedUser() user: User,
    @Param("id", ParseIntPipe) id: TaskId,
    @Body() updateTaskDto: UpdateTaskDto,
  ): Promise<ExistingTaskDto> {
    const isAuthorized = await this.authorizationService.canUpdateTask(
      user,
      id,
    );

    if (!isAuthorized) {
      throw new ForbiddenException();
    }

    const task = await this.tasksService.update(id, updateTaskDto);
    return ExistingTaskDto.fromQueryResult(task);
  }

  @Patch(":id/file")
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    type: UpdateTaskFileDto,
    description: "The new task file",
  })
  @ApiCreatedResponse({ type: ExistingTaskDto })
  @ApiForbiddenResponse()
  @ApiNotFoundResponse()
  @UseInterceptors(FileInterceptor("file"))
  async updateFile(
    @AuthenticatedUser() user: User,
    @Param("id", ParseIntPipe) id: TaskId,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ExistingTaskDto> {
    const isAuthorized = await this.authorizationService.canUpdateTask(
      user,
      id,
    );

    if (!isAuthorized) {
      throw new ForbiddenException();
    }

    const task = await this.tasksService.updateFile(
      id,
      file.mimetype,
      file.buffer,
    );

    return ExistingTaskDto.fromQueryResult(task);
  }

  @Delete(":id")
  @ApiOkResponse({ type: DeletedTaskDto })
  @ApiForbiddenResponse()
  @ApiNotFoundResponse()
  async remove(
    @AuthenticatedUser() user: User,
    @Param("id", ParseIntPipe) id: TaskId,
  ): Promise<DeletedTaskDto> {
    const isAuthorized = await this.authorizationService.canDeleteTask(
      user,
      id,
    );

    if (!isAuthorized) {
      throw new ForbiddenException();
    }

    const task = await this.tasksService.deleteById(id);
    return DeletedTaskDto.fromQueryResult(task);
  }
}
