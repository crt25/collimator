import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import {
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import "multer";
import { Express } from "express";
import { Student, User, UserType } from "@prisma/client";
import { JsonToObjectsInterceptor } from "src/utilities/json-to-object-interceptor";
import { fromQueryResults } from "../helpers";
import { AuthorizationService } from "../authorization/authorization.service";
import {
  AdminOnly,
  NonUserRoles,
  Roles,
  StudentOnly,
} from "../authentication/role.decorator";
import { AuthenticatedStudent } from "../authentication/authenticated-student.decorator";
import { AuthenticatedUser } from "../authentication/authenticated-user.decorator";
import { SolutionsService } from "./solutions.service";
import { CreateSolutionDto, ExistingSolutionDto, SolutionId } from "./dto";
import { CurrentAnalysisDto } from "./dto/current-analysis.dto";

@Controller("classes/:classId/sessions/:sessionId/task/:taskId/solutions")
@ApiTags("solutions")
export class SolutionsController {
  constructor(
    private readonly solutionsService: SolutionsService,
    private readonly authorizationService: AuthorizationService,
  ) {}

  @Post()
  @StudentOnly()
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    type: CreateSolutionDto,
    description: "The solution",
  })
  @ApiCreatedResponse({ type: ExistingSolutionDto })
  @ApiForbiddenResponse()
  @UseInterceptors(FileInterceptor("file"), JsonToObjectsInterceptor(["tests"]))
  async create(
    @AuthenticatedStudent() student: Student,
    @Param("classId", ParseIntPipe) _classId: number,
    @Param("sessionId", ParseIntPipe) sessionId: number,
    @Param("taskId", ParseIntPipe) taskId: number,
    @Body() createSolutionDto: CreateSolutionDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ExistingSolutionDto> {
    const solution = await this.solutionsService.create(
      {
        ...createSolutionDto,
        sessionId,
        taskId,
        studentId: student.id,
        tests: {
          create: createSolutionDto.tests,
        },
      },
      file.mimetype,
      file.buffer,
    );

    return ExistingSolutionDto.fromQueryResult(solution);
  }

  @Get()
  @ApiOkResponse({ type: ExistingSolutionDto, isArray: true })
  async findAll(
    @AuthenticatedUser() user: User,
    @Param("classId", ParseIntPipe) _classId: number,
    @Param("sessionId", ParseIntPipe) sessionId: number,
    @Param("taskId", ParseIntPipe) taskId: number,
  ): Promise<ExistingSolutionDto[]> {
    const isAuthorized = await this.authorizationService.canListSolutions(
      user,
      sessionId,
    );

    if (!isAuthorized) {
      throw new ForbiddenException();
    }

    // TODO: add pagination support

    const solutions = await this.solutionsService.findMany({
      where: { sessionId, taskId },
      include: { tests: true },
    });
    return fromQueryResults(ExistingSolutionDto, solutions);
  }

  @Get("current-analyses")
  @ApiOkResponse({ type: CurrentAnalysisDto, isArray: true })
  async findCurrentAnalysis(
    @AuthenticatedUser() user: User,
    @Param("classId", ParseIntPipe) _classId: number,
    @Param("sessionId", ParseIntPipe) sessionId: number,
    @Param("taskId", ParseIntPipe) taskId: number,
  ): Promise<CurrentAnalysisDto[]> {
    const isAuthorized = await this.authorizationService.canListCurrentAnalyses(
      user,
      sessionId,
    );

    if (!isAuthorized) {
      throw new ForbiddenException();
    }

    const solutions = await this.solutionsService.findCurrentAnalyses(
      sessionId,
      taskId,
    );

    return fromQueryResults(CurrentAnalysisDto, solutions);
  }

  @Get("latest")
  @StudentOnly()
  @ApiOkResponse({ type: ExistingSolutionDto })
  @ApiForbiddenResponse()
  @ApiNotFoundResponse()
  async latestSolution(
    @AuthenticatedStudent() student: Student,
    @Param("classId", ParseIntPipe) _classId: number,
    @Param("sessionId", ParseIntPipe) sessionId: number,
    @Param("taskId", ParseIntPipe) taskId: number,
  ): Promise<StreamableFile> {
    const solution =
      await this.solutionsService.downloadLatestStudentSolutionOrThrow(
        sessionId,
        taskId,
        student.id,
      );

    return new StreamableFile(solution.data, {
      type: solution.mimeType,
    });
  }

  @Get(":id")
  @Roles([UserType.ADMIN, UserType.TEACHER, NonUserRoles.STUDENT])
  @ApiOkResponse({ type: ExistingSolutionDto })
  @ApiForbiddenResponse()
  @ApiNotFoundResponse()
  async findOne(
    @AuthenticatedUser() user: User | null,
    @AuthenticatedStudent() student: Student | null,
    @Param("classId", ParseIntPipe) _classId: number,
    @Param("sessionId", ParseIntPipe) sessionId: number,
    @Param("taskId", ParseIntPipe) taskId: number,
    @Param("id", ParseIntPipe) id: SolutionId,
  ): Promise<ExistingSolutionDto> {
    const isAuthorized = await this.authorizationService.canViewSolution(
      user,
      student,
      id,
    );

    if (!isAuthorized) {
      throw new ForbiddenException();
    }

    const solution = await this.solutionsService.findByIdOrThrow(
      sessionId,
      taskId,
      id,
    );
    return ExistingSolutionDto.fromQueryResult(solution);
  }

  @Get(":id/download")
  @Roles([UserType.ADMIN, UserType.TEACHER, NonUserRoles.STUDENT])
  @ApiOkResponse(/*??*/)
  @ApiForbiddenResponse()
  @ApiNotFoundResponse()
  async downloadOne(
    @AuthenticatedUser() user: User | null,
    @AuthenticatedStudent() student: Student | null,
    @Param("classId", ParseIntPipe) _classId: number,
    @Param("sessionId", ParseIntPipe) sessionId: number,
    @Param("taskId", ParseIntPipe) taskId: number,
    @Param("id", ParseIntPipe) id: SolutionId,
  ): Promise<StreamableFile> {
    const isAuthorized = await this.authorizationService.canViewSolution(
      user,
      student,
      id,
    );

    if (!isAuthorized) {
      throw new ForbiddenException();
    }

    const solution = await this.solutionsService.downloadByIdOrThrow(
      sessionId,
      taskId,
      id,
    );
    return new StreamableFile(solution.data, {
      type: solution.mimeType,
    });
  }

  @Delete(":id")
  @AdminOnly()
  @ApiOperation({
    summary: "Delete all solutions by a student for a given session/task",
  })
  @ApiNoContentResponse()
  @ApiForbiddenResponse()
  @ApiNotFoundResponse()
  @HttpCode(204)
  async deleteOne(
    @Param("classId", ParseIntPipe) _classId: number,
    @Param("sessionId", ParseIntPipe) sessionId: number,
    @Param("taskId", ParseIntPipe) taskId: number,
    @Param("id", ParseIntPipe) id: SolutionId,
  ): Promise<void> {
    const succeeded = await this.solutionsService.deleteAllSolutionsById(
      sessionId,
      taskId,
      id,
    );
    if (!succeeded) {
      throw new NotFoundException();
    }
  }
}
