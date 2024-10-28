import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  StreamableFile,
  UseInterceptors,
} from "@nestjs/common";
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { TaskEntity } from "./entities/task.entity";
import { CreateTaskDto } from "./dto/create-task.dto";
import { UpdateTaskDto } from "./dto/update-task.dto";
import { TasksService } from "./services/tasks.service";
import { TaskInfoEntity } from "./entities/task-info.entity";

@Controller("tasks")
@ApiTags("tasks")
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiCreatedResponse({ type: TaskEntity })
  async create(@Body() createTaskDto: CreateTaskDto): Promise<TaskEntity> {
    return new TaskEntity(await this.tasksService.create(createTaskDto));
  }

  @Get()
  @ApiOkResponse({ type: TaskInfoEntity, isArray: true })
  async findAll(): Promise<TaskInfoEntity[]> {
    const tasks = await this.tasksService.findManyInfo({});

    return tasks.map((a) => new TaskInfoEntity(a));
  }

  @Get(":id")
  @ApiOkResponse({ type: TaskInfoEntity })
  async findOne(
    @Param("id", ParseIntPipe) id: number,
  ): Promise<TaskInfoEntity | null> {
    const task = await this.tasksService.findUniqueInfo({ id });
    return task ? new TaskInfoEntity(task) : null;
  }

  @Get(":id/download")
  @ApiOkResponse({ type: StreamableFile })
  async downloadTask(
    @Param("id", ParseIntPipe) id: number,
  ): Promise<StreamableFile | null> {
    const data = await this.tasksService.findUniqueData({ id });
    return data ? new StreamableFile(data) : null;
  }

  @Patch(":id")
  @ApiCreatedResponse({ type: TaskEntity })
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateTaskDto: UpdateTaskDto,
  ): Promise<TaskEntity> {
    return this.tasksService.update({
      where: { id: id },
      data: updateTaskDto,
    });
  }

  @Delete(":id")
  @ApiOkResponse({ type: TaskEntity })
  async remove(@Param("id", ParseIntPipe) id: number): Promise<TaskEntity> {
    return new TaskEntity(await this.tasksService.delete({ id }));
  }
}
