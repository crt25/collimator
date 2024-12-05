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
} from "@nestjs/common";
import {
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from "@nestjs/swagger";
import "multer";
import { SessionStatus, Student, User, UserType } from "@prisma/client";
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
import { AuthorizationService } from "../authorization/authorization.service";
import { AuthenticatedUser } from "../authentication/authenticated-user.decorator";
import { NonUserRoles, Public, Roles } from "../authentication/role.decorator";
import { AuthenticatedStudent } from "../authentication/authenticated-student.decorator";
import { IsSessionAnonymousDto } from "./dto/is-session-anonymous.dto";

@Controller("classes/:classId/sessions")
@ApiTags("sessions")
export class SessionsController {
  constructor(
    private readonly sessionsService: SessionsService,
    private readonly authorizationService: AuthorizationService,
  ) {}

  @Post()
  @ApiCreatedResponse({ type: ExistingSessionDto })
  @ApiForbiddenResponse()
  async create(
    @AuthenticatedUser() user: User,
    @Param("classId", ParseIntPipe) classId: number,
    @Body() createSessionDto: CreateSessionDto,
  ): Promise<ExistingSessionDto> {
    const isAuthorized = await this.authorizationService.canCreateSession(
      user,
      classId,
    );

    if (!isAuthorized) {
      throw new ForbiddenException();
    }

    const { taskIds, ...dto } = createSessionDto;
    const session = await this.sessionsService.create(classId, dto, taskIds);

    return ExistingSessionDto.fromQueryResult({
      ...session,
    });
  }

  @Get()
  @ApiOkResponse({ type: ExistingSessionDto, isArray: true })
  async findAll(
    @AuthenticatedUser() user: User,
    @Param("classId", ParseIntPipe) classId: number,
  ): Promise<ExistingSessionDto[]> {
    const isAuthorized = await this.authorizationService.canListSessions(
      user,
      classId,
    );

    if (!isAuthorized) {
      throw new ForbiddenException();
    }

    // TODO: add pagination support

    const sessions = await this.sessionsService.findMany({
      where: { classId },
    });
    return fromQueryResults(ExistingSessionDto, sessions);
  }

  @Get(":id/is-anonymous")
  @ApiOkResponse({ type: IsSessionAnonymousDto })
  @Public()
  @ApiNotFoundResponse()
  async isAnonymous(
    @Param("classId", ParseIntPipe) classId: number,
    @Param("id", ParseIntPipe) id: SessionId,
  ): Promise<IsSessionAnonymousDto> {
    const session = await this.sessionsService.findByIdAndClassOrThrow(
      id,
      classId,
    );

    return IsSessionAnonymousDto.fromQueryResult(session);
  }

  @Get(":id")
  @ApiOkResponse({ type: ExistingSessionExtendedDto })
  @Roles([UserType.TEACHER, UserType.ADMIN, NonUserRoles.STUDENT])
  @ApiForbiddenResponse()
  @ApiNotFoundResponse()
  async findOne(
    @AuthenticatedUser() user: User | null,
    @AuthenticatedStudent() student: Student | null,
    @Param("classId", ParseIntPipe) classId: number,
    @Param("id", ParseIntPipe) id: SessionId,
  ): Promise<ExistingSessionExtendedDto> {
    const isAuthorized = await this.authorizationService.canViewSession(
      user,
      student,
      id,
    );

    if (!isAuthorized) {
      throw new ForbiddenException();
    }

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
    @AuthenticatedUser() user: User,
    @Param("classId", ParseIntPipe) classId: number,
    @Param("id", ParseIntPipe) id: SessionId,
  ): Promise<ExistingSessionDto> {
    const isAuthorized = await this.authorizationService.canUpdateSession(
      user,
      id,
    );

    if (!isAuthorized) {
      throw new ForbiddenException();
    }

    return this.changeStatus(user, classId, id, SessionStatus.ONGOING);
  }

  @Post(":id/pause")
  @ApiOkResponse({ type: ExistingSessionDto })
  @ApiForbiddenResponse()
  @ApiNotFoundResponse()
  async pause(
    @AuthenticatedUser() user: User,
    @Param("classId", ParseIntPipe) classId: number,
    @Param("id", ParseIntPipe) id: SessionId,
  ): Promise<ExistingSessionDto> {
    return this.changeStatus(user, classId, id, SessionStatus.PAUSED);
  }

  @Post(":id/finish")
  @ApiOkResponse({ type: ExistingSessionDto })
  @ApiForbiddenResponse()
  @ApiNotFoundResponse()
  async finish(
    @AuthenticatedUser() user: User,
    @Param("classId", ParseIntPipe) classId: number,
    @Param("id", ParseIntPipe) id: SessionId,
  ): Promise<ExistingSessionDto> {
    return this.changeStatus(user, classId, id, SessionStatus.FINISHED);
  }

  async changeStatus(
    authenticatedUser: User,
    classId: number,
    id: SessionId,
    status: SessionStatus,
  ): Promise<ExistingSessionDto> {
    const isAuthorized = await this.authorizationService.canUpdateSession(
      authenticatedUser,
      id,
    );

    if (!isAuthorized) {
      throw new ForbiddenException();
    }

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
    @AuthenticatedUser() user: User,
    @Param("classId", ParseIntPipe) classId: number,
    @Param("id", ParseIntPipe) id: SessionId,
    @Body() updateSessionDto: UpdateSessionDto,
  ): Promise<ExistingSessionDto> {
    const isAuthorized = await this.authorizationService.canUpdateSession(
      user,
      id,
    );

    if (!isAuthorized) {
      throw new ForbiddenException();
    }

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
    @AuthenticatedUser() user: User,
    @Param("classId", ParseIntPipe) classId: number,
    @Param("id", ParseIntPipe) id: SessionId,
  ): Promise<DeletedSessionDto> {
    const isAuthorized = await this.authorizationService.canDeleteSession(
      user,
      id,
    );

    if (!isAuthorized) {
      throw new ForbiddenException();
    }

    const session = await this.sessionsService.deletedByIdAndClass(id, classId);
    return DeletedSessionDto.fromQueryResult(session);
  }
}
