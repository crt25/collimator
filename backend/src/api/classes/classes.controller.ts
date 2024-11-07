import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
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
import { plainToInstance } from "class-transformer";
import {
  CreateClassDto,
  ExistingClassDto,
  UpdateClassDto,
  DeletedClassDto,
  ClassId,
  ExistingClassWithTeacherDto,
  ExistingClassExtendedDto,
} from "./dto";
import { ClassesService } from "./classes.service";
import { fromQueryResults } from "../helpers";

@Controller("classes")
@ApiTags("classes")
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  @Post()
  @ApiCreatedResponse({ type: ExistingClassDto })
  @ApiForbiddenResponse()
  async create(
    @Body() createClassDto: CreateClassDto,
  ): Promise<ExistingClassDto> {
    const klass = await this.classesService.create(createClassDto);
    return plainToInstance(ExistingClassDto, klass);
  }

  @Get()
  @ApiQuery({ name: "teacherId", required: false, type: Number })
  @ApiOkResponse({ type: ExistingClassWithTeacherDto, isArray: true })
  async findAll(
    @Query("teacherId", new ParseIntPipe({ optional: true }))
    teacherId?: number,
  ): Promise<ExistingClassWithTeacherDto[]> {
    // TODO: add pagination support

    const classes = await this.classesService.listClassesWithTeacher({
      // TODO: Implement this properly when auth is available
      // TODO: Only allow teachers to see their own classes
      where: teacherId ? { teacherId } : undefined,
    });

    return fromQueryResults(ExistingClassWithTeacherDto, classes);
  }

  @Get(":id")
  @ApiOkResponse({ type: ExistingClassExtendedDto })
  @ApiForbiddenResponse()
  @ApiNotFoundResponse()
  async findOne(
    @Param("id", ParseIntPipe) id: ClassId,
  ): Promise<ExistingClassExtendedDto> {
    const klass = await this.classesService.findByIdOrThrow(id);
    return ExistingClassExtendedDto.fromQueryResult(klass);
  }

  @Patch(":id")
  @ApiCreatedResponse({ type: ExistingClassDto })
  @ApiForbiddenResponse()
  @ApiNotFoundResponse()
  async update(
    @Param("id", ParseIntPipe) id: ClassId,
    @Body() updateClassDto: UpdateClassDto,
  ): Promise<ExistingClassDto> {
    const klass = await this.classesService.update(id, updateClassDto);
    return ExistingClassDto.fromQueryResult(klass);
  }

  @Delete(":id")
  @ApiOkResponse({ type: DeletedClassDto })
  @ApiForbiddenResponse()
  @ApiNotFoundResponse()
  async remove(
    @Param("id", ParseIntPipe) id: ClassId,
  ): Promise<DeletedClassDto> {
    const klass = await this.classesService.deleteById(id);
    return DeletedClassDto.fromQueryResult(klass);
  }
}
