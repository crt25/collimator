import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from "@nestjs/common";
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { SessionEntity } from "./entities/session.entity";
import { CreateSessionDto } from "./dto/create-session.dto";
import { UpdateSessionDto } from "./dto/update-session.dto";
import { SessionsService } from "src/sessions/services/sessions.service";
import { SessionTasksService } from "src/sessions/services/session-task.service";

@Controller("sessions")
@ApiTags("sessions")
export class SessionsController {
  constructor(
    private readonly sessionsService: SessionsService,
    private readonly sessionTasksService: SessionTasksService,
  ) {}

  @Post()
  @ApiCreatedResponse({ type: SessionEntity })
  async create(
    @Body() createSessionDto: CreateSessionDto,
  ): Promise<SessionEntity> {
    return new SessionEntity(
      await this.sessionsService.create(createSessionDto),
    );
  }

  @Get()
  @ApiOkResponse({ type: SessionEntity, isArray: true })
  async findAll(): Promise<SessionEntity[]> {
    const sessions = await this.sessionsService.findMany({});

    return sessions.map((klass) => new SessionEntity(klass));
  }

  @Get(":id")
  @ApiOkResponse({ type: SessionEntity })
  async findOne(
    @Param("id", ParseIntPipe) id: number,
  ): Promise<SessionEntity | null> {
    const user = await this.sessionsService.findUnique({
      where: { id },
      include: { teacher: { include: { user: true } } },
    });
    return user ? new SessionEntity(user) : null;
  }

  @Patch(":id")
  @ApiCreatedResponse({ type: SessionEntity })
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateSessionDto: UpdateSessionDto,
  ): Promise<SessionEntity> {
    const klass = await this.sessionsService.update({
      where: { id },
      data: updateSessionDto,
    });

    if (updateSessionDto.tasks !== undefined) {
      await this.sessionTasksService.replaceTasks(id, updateSessionDto.tasks);
    }

    return new SessionEntity(klass);
  }

  @Delete(":id")
  @ApiOkResponse({ type: SessionEntity })
  async remove(@Param("id", ParseIntPipe) id: number): Promise<SessionEntity> {
    return new SessionEntity(await this.sessionsService.delete({ id }));
  }
}
