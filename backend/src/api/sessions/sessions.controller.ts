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
import {
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from "@nestjs/swagger";
import "multer";
import { SessionStatus } from "@prisma/client";
import {
  CreateSessionDto,
  ExistingSessionDto,
  UpdateSessionDto,
  DeletedSessionDto,
  ExistingSessionExtendedDto,
  SessionId,
} from "./dto";
import { SessionsService } from "./sessions.service";
import { fromQueryResults } from "../helpers";

@Controller("classes/:classId/sessions")
@ApiTags("sessions")
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post()
  @ApiCreatedResponse({ type: ExistingSessionDto })
  @ApiForbiddenResponse()
  async create(
    @Param("classId", ParseIntPipe) classId: number,
    @Body() createSessionDto: CreateSessionDto,
  ): Promise<ExistingSessionDto> {
    const { taskIds, ...dto } = createSessionDto;
    const session = await this.sessionsService.create(classId, dto, taskIds);

    return ExistingSessionDto.fromQueryResult({
      ...session,
    });
  }

  @Get()
  @ApiOkResponse({ type: ExistingSessionDto, isArray: true })
  async findAll(
    @Param("classId", ParseIntPipe) classId: number,
  ): Promise<ExistingSessionDto[]> {
    // TODO: add pagination support

    const sessions = await this.sessionsService.findMany({
      where: { classId },
    });
    return fromQueryResults(ExistingSessionDto, sessions);
  }

  @Get(":id")
  @ApiOkResponse({ type: ExistingSessionExtendedDto })
  @ApiForbiddenResponse()
  @ApiNotFoundResponse()
  async findOne(
    @Param("classId", ParseIntPipe) classId: number,
    @Param("id", ParseIntPipe) id: SessionId,
  ): Promise<ExistingSessionExtendedDto> {
    const session = await this.sessionsService.findByIdAndClassOrThrow(
      id,
      classId,
    );
    return ExistingSessionExtendedDto.fromQueryResult(session);
  }

  @Post(":id/start")
  @ApiOkResponse({ type: ExistingSessionDto })
  @ApiForbiddenResponse()
  @ApiNotFoundResponse()
  async start(
    @Param("classId", ParseIntPipe) classId: number,
    @Param("id", ParseIntPipe) id: SessionId,
  ): Promise<ExistingSessionDto> {
    return this.changeStatus(classId, id, SessionStatus.ONGOING);
  }

  @Post(":id/pause")
  @ApiOkResponse({ type: ExistingSessionDto })
  @ApiForbiddenResponse()
  @ApiNotFoundResponse()
  async pause(
    @Param("classId", ParseIntPipe) classId: number,
    @Param("id", ParseIntPipe) id: SessionId,
  ): Promise<ExistingSessionDto> {
    return this.changeStatus(classId, id, SessionStatus.PAUSED);
  }

  @Post(":id/finish")
  @ApiOkResponse({ type: ExistingSessionDto })
  @ApiForbiddenResponse()
  @ApiNotFoundResponse()
  async finish(
    @Param("classId", ParseIntPipe) classId: number,
    @Param("id", ParseIntPipe) id: SessionId,
  ): Promise<ExistingSessionDto> {
    return this.changeStatus(classId, id, SessionStatus.FINISHED);
  }

  async changeStatus(
    classId: number,
    id: SessionId,
    status: SessionStatus,
  ): Promise<ExistingSessionDto> {
    const session = await this.sessionsService.changeStatusByIdAndClass(
      id,
      status,
      classId,
    );
    return ExistingSessionDto.fromQueryResult(session);
  }

  @Patch(":id")
  @ApiCreatedResponse({ type: ExistingSessionDto })
  @ApiForbiddenResponse()
  @ApiNotFoundResponse()
  async update(
    @Param("classId", ParseIntPipe) classId: number,
    @Param("id", ParseIntPipe) id: SessionId,
    @Body() updateSessionDto: UpdateSessionDto,
  ): Promise<ExistingSessionDto> {
    const { taskIds, ...dto } = updateSessionDto;
    const session = await this.sessionsService.update(
      id,
      dto,
      taskIds,
      classId,
    );
    return ExistingSessionDto.fromQueryResult(session);
  }

  @Delete(":id")
  @ApiOkResponse({ type: DeletedSessionDto })
  @ApiForbiddenResponse()
  @ApiNotFoundResponse()
  async remove(
    @Param("classId", ParseIntPipe) classId: number,
    @Param("id", ParseIntPipe) id: SessionId,
  ): Promise<DeletedSessionDto> {
    const session = await this.sessionsService.deletedByIdAndClass(id, classId);
    return DeletedSessionDto.fromQueryResult(session);
  }
}
