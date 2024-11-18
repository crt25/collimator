import {
  Body,
  Controller,
  ForbiddenException,
  Get,
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
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from "@nestjs/swagger";
import "multer";
import { CreateSolutionDto, ExistingSolutionDto, SolutionId } from "./dto";
import { SolutionsService } from "./solutions.service";
import { fromQueryResults } from "../helpers";
import { Express } from "express";
import { AuthorizationService } from "../authorization/authorization.service";
import {
  NonUserRoles,
  Roles,
  StudentOnly,
} from "../authentication/role.decorator";
import { AuthenticatedStudent } from "../authentication/authenticated-student.decorator";
import { Student, User, UserType } from "@prisma/client";
import { AuthenticatedUser } from "../authentication/authenticated-user.decorator";
import { SolutionAnalysisService } from "./solution-analysis.service";

@Controller("classes/:classId/sessions/:sessionId/task/:taskId/solutions")
@ApiTags("solutions")
export class SolutionsController {
  constructor(
    private readonly solutionsService: SolutionsService,
    private analysisService: SolutionAnalysisService,
    private authorizationService: AuthorizationService,
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
  @UseInterceptors(FileInterceptor("file"))
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
      },
      file.mimetype,
      file.buffer,
    );

    // perform the analysis but do *not* wait for the promise to resolve
    // this will happen in the background
    this.analysisService.performAnalysis(solution);

    return ExistingSolutionDto.fromQueryResult({
      ...solution,
      mimeType: file.mimetype,
    });
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
    });
    return fromQueryResults(ExistingSolutionDto, solutions);
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
}