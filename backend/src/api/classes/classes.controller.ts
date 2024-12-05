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
import { AuthorizationService } from "../authorization/authorization.service";
import { AuthenticatedUser } from "../authentication/authenticated-user.decorator";
import { User } from "@prisma/client";

@Controller("classes")
@ApiTags("classes")
export class ClassesController {
  constructor(
    private readonly classesService: ClassesService,
    private readonly authorizationService: AuthorizationService,
  ) {}

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
    @AuthenticatedUser() user: User,
    @Query("teacherId", new ParseIntPipe({ optional: true }))
    teacherId?: number,
  ): Promise<ExistingClassWithTeacherDto[]> {
    const isAuthorized =
      await this.authorizationService.canListClassesOfTeacher(user, teacherId);

    if (!isAuthorized) {
      throw new ForbiddenException();
    }

    // TODO: add pagination support

    const classes = await this.classesService.listClassesWithTeacher({
      where: teacherId ? { teacherId } : undefined,
    });

    return fromQueryResults(ExistingClassWithTeacherDto, classes);
  }

  @Get(":id")
  @ApiOkResponse({ type: ExistingClassExtendedDto })
  @ApiForbiddenResponse()
  @ApiNotFoundResponse()
  async findOne(
    @AuthenticatedUser() user: User,
    @Param("id", ParseIntPipe) id: ClassId,
  ): Promise<ExistingClassExtendedDto> {
    const isAuthorized = await this.authorizationService.canViewClass(user, id);

    if (!isAuthorized) {
      throw new ForbiddenException();
    }

    const klass = await this.classesService.findByIdOrThrow(id);
    return ExistingClassExtendedDto.fromQueryResult(klass);
  }

  @Patch(":id")
  @ApiCreatedResponse({ type: ExistingClassDto })
  @ApiForbiddenResponse()
  @ApiNotFoundResponse()
  async update(
    @AuthenticatedUser() user: User,
    @Param("id", ParseIntPipe) id: ClassId,
    @Body() updateClassDto: UpdateClassDto,
  ): Promise<ExistingClassDto> {
    const isAuthorized = await this.authorizationService.canUpdateClass(
      user,
      id,
    );

    if (!isAuthorized) {
      throw new ForbiddenException();
    }

    const klass = await this.classesService.update(id, updateClassDto);
    return ExistingClassDto.fromQueryResult(klass);
  }

  @Delete(":id")
  @ApiOkResponse({ type: DeletedClassDto })
  @ApiForbiddenResponse()
  @ApiNotFoundResponse()
  async remove(
    @AuthenticatedUser() user: User,
    @Param("id", ParseIntPipe) id: ClassId,
  ): Promise<DeletedClassDto> {
    const isAuthorized = await this.authorizationService.canDeleteClass(
      user,
      id,
    );

    if (!isAuthorized) {
      throw new ForbiddenException();
    }

    const klass = await this.classesService.deleteById(id);
    return DeletedClassDto.fromQueryResult(klass);
  }
}
