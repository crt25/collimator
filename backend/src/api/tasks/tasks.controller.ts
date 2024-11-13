import {
  Body,
  Controller,
  Delete,
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

@Controller("tasks")
@ApiTags("tasks")
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

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
    @Body() createTaskDto: CreateTaskDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ExistingTaskDto> {
    const task = await this.tasksService.create(
      {
        ...createTaskDto,
        // TODO: add creatorId when authentication is implemented
        // creatorId: 1,
      },
      file.mimetype,
      file.buffer,
    );

    return ExistingTaskDto.fromQueryResult({
      ...task,
      mimeType: file.mimetype,
    });
  }

  @Get()
  @ApiOkResponse({ type: ExistingTaskDto, isArray: true })
  async findAll(): Promise<ExistingTaskDto[]> {
    // TODO: add pagination support

    const tasks = await this.tasksService.findMany({});
    return fromQueryResults(ExistingTaskDto, tasks);
  }

  @Get(":id")
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
    @Param("id", ParseIntPipe) id: TaskId,
    @Body() updateTaskDto: UpdateTaskDto,
  ): Promise<ExistingTaskDto> {
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
    @Param("id", ParseIntPipe) id: TaskId,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ExistingTaskDto> {
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
  async remove(@Param("id", ParseIntPipe) id: TaskId): Promise<DeletedTaskDto> {
    const task = await this.tasksService.deleteById(id);
    return DeletedTaskDto.fromQueryResult(task);
  }
}
