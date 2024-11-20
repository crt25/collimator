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
import { CriteriaBasedAnalyzerService } from "src/data-analyzer/criteria-based-analyzer.service";
import { GeneralAst } from "src/ast/types/general-ast";
import { AnalysisInputDto } from "./dto/analysis/analysis-input.dto";
import {
  AnalysisOutputDto,
  AnyAnalysisCriterionOutputDto,
} from "./dto/analysis/analysis-output.dto";
import {
  CallsFunctionCriterionInputDto,
  CallsFunctionCriterionOutputDto,
} from "./dto/analysis/criteria/calls-function-criterion.dto";
import {
  ContainsLoopDeclarationCriterionInputDto,
  ContainsLoopDeclarationCriterionOutputDto,
} from "./dto/analysis/criteria/contains-loop-criterion.dto";
import {
  ContainsFunctionDeclarationCriterionInputDto,
  ContainsFunctionDeclarationCriterionOutputDto,
} from "./dto/analysis/criteria/contains-function-declaration-criterion.dto";
import {
  ContainsConditionCriterionInputDto,
  ContainsConditionCriterionOutputDto,
} from "./dto/analysis/criteria/contains-condition-criterion.dto";
import {
  AnalysisInput,
  Criterion,
} from "src/data-analyzer/criteria-based-analysis-worker.piscina";
import { match } from "ts-pattern";

@Controller("classes/:classId/sessions/:sessionId/task/:taskId/solutions")
@ApiTags("solutions")
export class SolutionsController {
  constructor(
    private readonly solutionsService: SolutionsService,
    private readonly criteriaBasedAnalyzerService: CriteriaBasedAnalyzerService,
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

  @Post("analysis")
  @ApiOkResponse({ type: AnalysisOutputDto, isArray: true })
  @ApiForbiddenResponse()
  @ApiNotFoundResponse()
  async analysis(
    @Param("classId", ParseIntPipe) _classId: number,
    @Param("sessionId", ParseIntPipe) sessionId: number,
    @Param("taskId", ParseIntPipe) taskId: number,
    @Body() input: AnalysisInputDto,
  ): Promise<AnalysisOutputDto[]> {
    const analyses = await this.solutionsService.findAllCurrentAnalyses(
      sessionId,
      taskId,
    );

    const criteriaAnalysisOutput =
      await this.criteriaBasedAnalyzerService.analyze(
        analyses.map(
          (analysis) => JSON.parse(analysis.genericAst) as GeneralAst,
        ),
        input.criteria.map((c) =>
          match(c)
            .returnType<AnalysisInput>()
            .with(
              { criterion: Criterion.callsFunction },
              CallsFunctionCriterionInputDto.toAnalysisInput,
            )
            .with(
              { criterion: Criterion.containsCondition },
              ContainsConditionCriterionInputDto.toAnalysisInput,
            )
            .with(
              { criterion: Criterion.containsFunctionDeclaration },
              ContainsFunctionDeclarationCriterionInputDto.toAnalysisInput,
            )
            .with(
              { criterion: Criterion.containsLoop },
              ContainsLoopDeclarationCriterionInputDto.toAnalysisInput,
            )
            .exhaustive(),
        ),
      );

    return criteriaAnalysisOutput
      .map((criteriaOutputs) =>
        criteriaOutputs.map((result) =>
          match(result)
            .returnType<AnyAnalysisCriterionOutputDto>()
            .with(
              { criterion: Criterion.callsFunction },
              CallsFunctionCriterionOutputDto.fromAnalysisOutput,
            )
            .with(
              { criterion: Criterion.containsCondition },
              ContainsConditionCriterionOutputDto.fromAnalysisOutput,
            )
            .with(
              { criterion: Criterion.containsFunctionDeclaration },
              ContainsFunctionDeclarationCriterionOutputDto.fromAnalysisOutput,
            )
            .with(
              { criterion: Criterion.containsLoop },
              ContainsLoopDeclarationCriterionOutputDto.fromAnalysisOutput,
            )
            .exhaustive(),
        ),
      )
      .map((analyzedCriteriaOutputs, index) =>
        AnalysisOutputDto.fromQueryResult({
          solutionId: analyses[index].solutionId,
          criteria: analyzedCriteriaOutputs,
        }),
      );
  }
}
