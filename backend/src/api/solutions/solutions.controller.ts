import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
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
  ApiQuery,
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
import { ClassId } from "../classes/dto";
import { SessionId } from "../sessions/dto";
import { TaskId } from "../tasks/dto";
import { SolutionsService } from "./solutions.service";
import { CreateSolutionDto } from "./dto";
import {
  ExistingStudentSolutionDto,
  StudentSolutionId,
} from "./dto/existing-student-solution.dto";
import { CurrentStudentAnalysisDto } from "./dto/current-student-analysis.dto";
import { ReferenceAnalysisDto } from "./dto/reference-analysis.dto";
import { CurrentAnalysesDto } from "./dto/current-analyses.dto";
import { PatchStudentSolutionIsReferenceDto } from "./dto/patch-student-solution-is-reference.dto";

@Controller("classes/:classId/sessions/:sessionId/task/:taskId/solutions")
@ApiTags("solutions")
export class SolutionsController {
  constructor(
    private readonly solutionsService: SolutionsService,
    private readonly authorizationService: AuthorizationService,
  ) {}

  @Post("student")
  @StudentOnly()
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    type: CreateSolutionDto,
    description: "The solution",
  })
  @ApiCreatedResponse({ type: ExistingStudentSolutionDto })
  @ApiForbiddenResponse()
  @UseInterceptors(FileInterceptor("file"), JsonToObjectsInterceptor(["tests"]))
  async createStudentSolution(
    @AuthenticatedStudent() student: Student,
    @Param("classId", ParseIntPipe) _classId: ClassId,
    @Param("sessionId", ParseIntPipe) sessionId: SessionId,
    @Param("taskId", ParseIntPipe) taskId: TaskId,
    @Body() createSolutionDto: CreateSolutionDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ExistingStudentSolutionDto> {
    const studentSolution = await this.solutionsService.createStudentSolution(
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

    return ExistingStudentSolutionDto.fromQueryResult(studentSolution);
  }

  @Get("student")
  @ApiOkResponse({ type: ExistingStudentSolutionDto, isArray: true })
  async findAllStudentSolutions(
    @AuthenticatedUser() user: User,
    @Param("classId", ParseIntPipe) _classId: number,
    @Param("sessionId", ParseIntPipe) sessionId: number,
    @Param("taskId", ParseIntPipe) taskId: number,
  ): Promise<ExistingStudentSolutionDto[]> {
    const isAuthorized = await this.authorizationService.canListSolutions(
      user,
      sessionId,
    );

    if (!isAuthorized) {
      throw new ForbiddenException();
    }

    // TODO: add pagination support

    const solutions = await this.solutionsService.findManyStudentSolutions({
      where: {
        sessionId,
        taskId,
      },
    });

    return fromQueryResults(ExistingStudentSolutionDto, solutions);
  }

  @Get("current-analyses")
  @ApiQuery({
    name: "includeSoftDelete",
    required: false,
    type: Boolean,
  })
  @ApiOkResponse({ type: CurrentAnalysesDto })
  async findCurrentAnalyses(
    @AuthenticatedUser() user: User,
    @Param("classId", ParseIntPipe) _classId: number,
    @Param("sessionId", ParseIntPipe) sessionId: number,
    @Param("taskId", ParseIntPipe) taskId: number,
    @Query("includeSoftDelete", new ParseBoolPipe({ optional: true }))
    includeSoftDelete?: boolean,
  ): Promise<CurrentAnalysesDto> {
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
      includeSoftDelete,
    );

    const studentAnalyses: CurrentStudentAnalysisDto[] = fromQueryResults(
      CurrentStudentAnalysisDto,
      solutions[0],
    );

    const referenceAnalyses: ReferenceAnalysisDto[] = fromQueryResults(
      ReferenceAnalysisDto,
      solutions[1],
    );

    return {
      studentAnalyses,
      referenceAnalyses,
    };
  }

  @Get("student/latest")
  @StudentOnly()
  @ApiQuery({
    name: "includeSoftDelete",
    required: false,
    type: Boolean,
  })
  @ApiOkResponse({ type: ExistingStudentSolutionDto })
  @ApiForbiddenResponse()
  @ApiNotFoundResponse()
  async downloadLatestStudentSolution(
    @AuthenticatedStudent() student: Student,
    @Param("classId", ParseIntPipe) _classId: number,
    @Param("sessionId", ParseIntPipe) sessionId: number,
    @Param("taskId", ParseIntPipe) taskId: number,
    @Query("includeSoftDelete", new ParseBoolPipe({ optional: true }))
    includeSoftDelete?: boolean,
  ): Promise<StreamableFile> {
    const solution =
      await this.solutionsService.downloadLatestStudentSolutionOrThrow(
        sessionId,
        taskId,
        student.id,
        includeSoftDelete,
      );

    return new StreamableFile(solution.data, {
      type: solution.mimeType,
    });
  }

  @Get("student/:id")
  @Roles([UserType.ADMIN, UserType.TEACHER, NonUserRoles.STUDENT])
  @ApiQuery({
    name: "includeSoftDelete",
    required: false,
    type: Boolean,
  })
  @ApiOkResponse({ type: ExistingStudentSolutionDto })
  @ApiForbiddenResponse()
  @ApiNotFoundResponse()
  async findOneStudentSolution(
    @AuthenticatedUser() user: User | null,
    @AuthenticatedStudent() student: Student | null,
    @Param("classId", ParseIntPipe) _classId: number,
    @Param("sessionId", ParseIntPipe) sessionId: number,
    @Param("taskId", ParseIntPipe) taskId: number,
    @Param("id", ParseIntPipe) id: StudentSolutionId,
    @Query("includeSoftDelete", new ParseBoolPipe({ optional: true }))
    includeSoftDelete?: boolean,
  ): Promise<ExistingStudentSolutionDto> {
    const isAuthorized = await this.authorizationService.canViewStudentSolution(
      user,
      student,
      id,
    );

    if (!isAuthorized) {
      throw new ForbiddenException();
    }

    const solution = await this.solutionsService.findByStudentIdOrThrow(
      sessionId,
      taskId,
      id,
      includeSoftDelete,
    );
    return ExistingStudentSolutionDto.fromQueryResult(solution);
  }

  @Get(":hash/download")
  @Roles([UserType.ADMIN, UserType.TEACHER, NonUserRoles.STUDENT])
  @ApiOkResponse(/*??*/)
  @ApiQuery({
    name: "includeSoftDelete",
    required: false,
    type: Boolean,
  })
  @ApiForbiddenResponse()
  @ApiNotFoundResponse()
  async downloadOne(
    @AuthenticatedUser() user: User | null,
    @AuthenticatedStudent() student: Student | null,
    @Param("classId", ParseIntPipe) _classId: number,
    @Param("sessionId", ParseIntPipe) _sessionId: number,
    @Param("taskId", ParseIntPipe) taskId: number,
    @Param("hash") hash: string,
    @Query("includeSoftDelete", new ParseBoolPipe({ optional: true }))
    includeSoftDelete?: boolean,
  ): Promise<StreamableFile> {
    const solutionHash = Buffer.from(hash, "base64url");
    const isAuthorized = await this.authorizationService.canViewSolution(
      user,
      student,
      taskId,
      solutionHash,
    );

    if (!isAuthorized) {
      throw new ForbiddenException();
    }

    const solution = await this.solutionsService.downloadByHashOrThrow(
      taskId,
      solutionHash,
      includeSoftDelete,
    );

    return new StreamableFile(solution.data, {
      type: solution.mimeType,
    });
  }

  @Patch("student/:id/isReference")
  @ApiOperation({
    summary: "Updates the isReference field of a student solution",
  })
  @ApiOkResponse()
  @ApiQuery({
    name: "includeSoftDelete",
    required: false,
    type: Boolean,
  })
  @ApiForbiddenResponse()
  @ApiNotFoundResponse()
  @HttpCode(204)
  @ApiBody({ type: PatchStudentSolutionIsReferenceDto })
  async patchStudentSolutionIsReference(
    @AuthenticatedUser() user: User | null,
    @Param("classId", ParseIntPipe) _classId: number,
    @Param("sessionId", ParseIntPipe) _sessionId: number,
    @Param("taskId", ParseIntPipe) _taskId: number,
    @Param("id", ParseIntPipe) id: StudentSolutionId,
    @Body() dto: PatchStudentSolutionIsReferenceDto,
    @Query("includeSoftDelete", new ParseBoolPipe({ optional: true }))
    includeSoftDelete?: boolean,
  ): Promise<void> {
    const isAuthorized =
      await this.authorizationService.canUpdateStudentSolutionIsReference(
        user,
        id,
      );

    if (!isAuthorized) {
      throw new ForbiddenException();
    }

    return this.solutionsService.updateStudentSolutionIsReference(
      id,
      dto.isReference,
      includeSoftDelete,
    );
  }

  @Delete("student/:id")
  @AdminOnly()
  @ApiOperation({
    summary: "Delete all solutions by a student for a given session/task",
  })
  @ApiNoContentResponse()
  @ApiForbiddenResponse()
  @ApiNotFoundResponse()
  @HttpCode(204)
  async deleteOneStudentSolution(
    @Param("classId", ParseIntPipe) _classId: number,
    @Param("sessionId", ParseIntPipe) sessionId: number,
    @Param("taskId", ParseIntPipe) taskId: number,
    @Param("id", ParseIntPipe) id: StudentSolutionId,
  ): Promise<void> {
    const succeeded = await this.solutionsService.deleteAllStudentSolutionsById(
      sessionId,
      taskId,
      id,
    );
    if (!succeeded) {
      throw new NotFoundException();
    }
  }
}
