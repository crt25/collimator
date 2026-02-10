import {
  Body,
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
} from "@nestjs/common";
import {
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";
import "multer";
import { SessionStatus, Student, User, UserType } from "@prisma/client";
import { fromQueryResults } from "../helpers";
import { AuthorizationService } from "../authorization/authorization.service";
import { AuthenticatedUser } from "../authentication/authenticated-user.decorator";
import {
  NonUserRoles,
  Public,
  Roles,
  StudentOnly,
} from "../authentication/role.decorator";
import { AuthenticatedStudent } from "../authentication/authenticated-student.decorator";
import { SessionsService } from "./sessions.service";
import {
  CopySessionDto,
  CreateSessionDto,
  ExistingSessionDto,
  UpdateSessionDto,
  DeletedSessionDto,
  ExistingSessionExtendedDto,
  SessionId,
} from "./dto";
import { IsSessionAnonymousDto } from "./dto/is-session-anonymous.dto";
import { StudentSessionProgressDto } from "./dto/student-session-progress.dto";
import { StudentTaskProgressDto } from "./dto/student-task-progress.dto";

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
  @ApiQuery({
    name: "includeSoftDelete",
    required: false,
    type: Boolean,
  })
  async findAll(
    @AuthenticatedUser() user: User,
    @Param("classId", ParseIntPipe) classId: number,
    @Query("includeSoftDelete", new ParseBoolPipe({ optional: true }))
    includeSoftDelete?: boolean,
  ): Promise<ExistingSessionDto[]> {
    const isAuthorized = await this.authorizationService.canListSessions(
      user,
      classId,
    );

    if (!isAuthorized) {
      throw new ForbiddenException();
    }

    // TODO: add pagination support

    const sessions = await this.sessionsService.findMany(
      {
        where: { classId },
      },
      includeSoftDelete,
    );
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
  @ApiQuery({
    name: "includeSoftDelete",
    required: false,
    type: Boolean,
  })
  @ApiForbiddenResponse()
  @ApiNotFoundResponse()
  async findOne(
    @AuthenticatedUser() user: User | null,
    @AuthenticatedStudent() student: Student | null,
    @Param("classId", ParseIntPipe) classId: number,
    @Param("id", ParseIntPipe) id: SessionId,
    @Query("includeSoftDelete", new ParseBoolPipe({ optional: true }))
    includeSoftDelete?: boolean,
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
      includeSoftDelete,
    );
    return ExistingSessionExtendedDto.fromQueryResult(session);
  }

  @Post(":id/start")
  @ApiOkResponse({ type: ExistingSessionDto })
  @ApiQuery({
    name: "includeSoftDelete",
    required: false,
    type: Boolean,
  })
  @ApiForbiddenResponse()
  @ApiNotFoundResponse()
  async start(
    @AuthenticatedUser() user: User,
    @Param("classId", ParseIntPipe) classId: number,
    @Param("id", ParseIntPipe) id: SessionId,
    @Query("includeSoftDelete", new ParseBoolPipe({ optional: true }))
    includeSoftDelete?: boolean,
  ): Promise<ExistingSessionDto> {
    const isAuthorized = await this.authorizationService.canUpdateSession(
      user,
      id,
    );

    if (!isAuthorized) {
      throw new ForbiddenException();
    }

    return this.changeStatus(
      user,
      classId,
      id,
      SessionStatus.ONGOING,
      includeSoftDelete,
    );
  }

  @Post(":id/pause")
  @ApiOkResponse({ type: ExistingSessionDto })
  @ApiQuery({
    name: "includeSoftDelete",
    required: false,
    type: Boolean,
  })
  @ApiForbiddenResponse()
  @ApiNotFoundResponse()
  async pause(
    @AuthenticatedUser() user: User,
    @Param("classId", ParseIntPipe) classId: number,
    @Param("id", ParseIntPipe) id: SessionId,
    @Query("includeSoftDelete", new ParseBoolPipe({ optional: true }))
    includeSoftDelete?: boolean,
  ): Promise<ExistingSessionDto> {
    return this.changeStatus(
      user,
      classId,
      id,
      SessionStatus.PAUSED,
      includeSoftDelete,
    );
  }

  @Post(":id/finish")
  @ApiOkResponse({ type: ExistingSessionDto })
  @ApiQuery({
    name: "includeSoftDelete",
    required: false,
    type: Boolean,
  })
  @ApiForbiddenResponse()
  @ApiNotFoundResponse()
  async finish(
    @AuthenticatedUser() user: User,
    @Param("classId", ParseIntPipe) classId: number,
    @Param("id", ParseIntPipe) id: SessionId,
    @Query("includeSoftDelete", new ParseBoolPipe({ optional: true }))
    includeSoftDelete?: boolean,
  ): Promise<ExistingSessionDto> {
    return this.changeStatus(
      user,
      classId,
      id,
      SessionStatus.FINISHED,
      includeSoftDelete,
    );
  }

  async changeStatus(
    authenticatedUser: User,
    classId: number,
    id: SessionId,
    status: SessionStatus,
    includeSoftDelete = false,
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
      includeSoftDelete,
    );
    return ExistingSessionDto.fromQueryResult(session);
  }

  @Patch(":id")
  @ApiCreatedResponse({ type: ExistingSessionDto })
  @ApiForbiddenResponse()
  @ApiQuery({
    name: "includeSoftDelete",
    required: false,
    type: Boolean,
  })
  @ApiNotFoundResponse()
  async update(
    @AuthenticatedUser() user: User,
    @Param("classId", ParseIntPipe) classId: number,
    @Param("id", ParseIntPipe) id: SessionId,
    @Body() updateSessionDto: UpdateSessionDto,
    @Query("includeSoftDelete", new ParseBoolPipe({ optional: true }))
    includeSoftDelete?: boolean,
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
      includeSoftDelete,
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

  @Post("copy")
  @ApiCreatedResponse({ type: ExistingSessionDto })
  @ApiForbiddenResponse()
  @ApiNotFoundResponse()
  @ApiQuery({ name: "includeSoftDelete", required: false })
  async copy(
    @AuthenticatedUser() user: User,
    @Param("classId", ParseIntPipe) classId: number,
    @Body() copySessionDto: CopySessionDto,
    @Query("includeSoftDelete", new ParseBoolPipe({ optional: true }))
    includeSoftDelete?: boolean,
  ): Promise<ExistingSessionDto> {
    const canCreateInTargetClass =
      await this.authorizationService.canCreateSession(user, classId);

    if (!canCreateInTargetClass) {
      throw new ForbiddenException();
    }

    const canViewSourceSession = await this.authorizationService.canViewSession(
      user,
      null,
      copySessionDto.sourceSessionId,
    );

    if (!canViewSourceSession) {
      throw new ForbiddenException();
    }

    const session = await this.sessionsService.copy(
      copySessionDto.sourceSessionId,
      classId,
      includeSoftDelete,
    );

    return ExistingSessionDto.fromQueryResult(session);
  }

  @Get(":id/progress")
  @ApiOkResponse({ type: StudentSessionProgressDto })
  @StudentOnly()
  @ApiForbiddenResponse()
  @ApiNotFoundResponse()
  async getSessionProgress(
    @AuthenticatedStudent() student: Student,
    @Param("classId", ParseIntPipe) classId: number,
    @Param("id", ParseIntPipe) id: SessionId,
  ): Promise<StudentSessionProgressDto> {
    const taskProgress = await this.sessionsService.getSessionProgress(
      id,
      student.id,
    );

    return StudentSessionProgressDto.fromQueryResult({
      id,
      taskProgress: taskProgress.map(StudentTaskProgressDto.fromQueryResult),
    });
  }
}
