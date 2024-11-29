import {
  Body,
  Controller,
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

@Controller("classes/:classId/sessions/:sessionId/task/:taskId/solutions")
@ApiTags("solutions")
export class SolutionsController {
  constructor(private readonly solutionsService: SolutionsService) {}

  @Post()
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    type: CreateSolutionDto,
    description: "The solution",
  })
  @ApiCreatedResponse({ type: ExistingSolutionDto })
  @ApiForbiddenResponse()
  @UseInterceptors(FileInterceptor("file"))
  async create(
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
        // TODO: add studentId when authentication is implemented
        studentId: "bob",
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
    @Param("classId", ParseIntPipe) _classId: number,
    @Param("sessionId", ParseIntPipe) sessionId: number,
    @Param("taskId", ParseIntPipe) taskId: number,
  ): Promise<ExistingSolutionDto[]> {
    // TODO: add pagination support
    // TODO: add authorization check

    const solutions = await this.solutionsService.findMany({
      where: { sessionId, taskId },
    });
    return fromQueryResults(ExistingSolutionDto, solutions);
  }

  @Get(":id")
  @ApiOkResponse({ type: ExistingSolutionDto })
  @ApiForbiddenResponse()
  @ApiNotFoundResponse()
  async findOne(
    @Param("classId", ParseIntPipe) _classId: number,
    @Param("sessionId", ParseIntPipe) sessionId: number,
    @Param("taskId", ParseIntPipe) taskId: number,
    @Param("id", ParseIntPipe) id: SolutionId,
  ): Promise<ExistingSolutionDto> {
    // TODO: add authorization check
    const solution = await this.solutionsService.findByIdOrThrow(
      sessionId,
      taskId,
      id,
    );
    return ExistingSolutionDto.fromQueryResult(solution);
  }

  @Get(":id/download")
  @ApiOkResponse(/*??*/)
  @ApiForbiddenResponse()
  @ApiNotFoundResponse()
  async downloadOne(
    @Param("classId", ParseIntPipe) _classId: number,
    @Param("sessionId", ParseIntPipe) sessionId: number,
    @Param("taskId", ParseIntPipe) taskId: number,
    @Param("id", ParseIntPipe) id: SolutionId,
  ): Promise<StreamableFile> {
    // TODO: add authorization check
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
