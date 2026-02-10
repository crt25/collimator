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
import { plainToInstance } from "class-transformer";
import { User, UserType } from "@prisma/client";
import { fromQueryResults } from "../helpers";
import { AuthorizationService } from "../authorization/authorization.service";
import { AuthenticatedUser } from "../authentication/authenticated-user.decorator";
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
  @ApiQuery({
    name: "includeSoftDelete",
    required: false,
    type: Boolean,
  })
  @ApiOkResponse({ type: ExistingClassWithTeacherDto, isArray: true })
  async findAll(
    @AuthenticatedUser() user: User,
    @Query("includeSoftDelete", new ParseBoolPipe({ optional: true }))
    includeSoftDelete = false,
  ): Promise<ExistingClassWithTeacherDto[]> {
    const teacherId = user.type === UserType.TEACHER ? user.id : undefined;

    const isAuthorized =
      await this.authorizationService.canListClassesOfTeacher(user, teacherId);

    if (!isAuthorized) {
      throw new ForbiddenException();
    }

    // TODO: add pagination support

    const classes = await this.classesService.listClassesWithTeacher(
      {
        where: teacherId ? { teacherId } : undefined,
      },
      includeSoftDelete,
    );

    return fromQueryResults(ExistingClassWithTeacherDto, classes);
  }

  @Get(":id")
  @ApiOkResponse({ type: ExistingClassExtendedDto })
  @ApiQuery({
    name: "includeSoftDelete",
    required: false,
    type: Boolean,
  })
  @ApiForbiddenResponse()
  @ApiNotFoundResponse()
  async findOne(
    @AuthenticatedUser() user: User,
    @Param("id", ParseIntPipe) id: ClassId,
    @Query("includeSoftDelete", new ParseBoolPipe({ optional: true }))
    includeSoftDelete = false,
  ): Promise<ExistingClassExtendedDto> {
    const isAuthorized = await this.authorizationService.canViewClass(user, id);

    if (!isAuthorized) {
      throw new ForbiddenException();
    }

    const klass = await this.classesService.findByIdOrThrow(
      id,
      includeSoftDelete,
    );

    // workaround for bug where class-transformer loses the Uint8Array type
    // see https://github.com/typestack/class-transformer/issues/1815
    // Buffers do not seem to be affected by this bug
    klass.students.forEach(
      (student) => (student.pseudonym = Buffer.from(student.pseudonym)),
    );

    return ExistingClassExtendedDto.fromQueryResult(klass);
  }

  @Patch(":id")
  @ApiCreatedResponse({ type: ExistingClassDto })
  @ApiQuery({
    name: "includeSoftDelete",
    required: false,
    type: Boolean,
  })
  @ApiForbiddenResponse()
  @ApiNotFoundResponse()
  async update(
    @AuthenticatedUser() user: User,
    @Param("id", ParseIntPipe) id: ClassId,
    @Body() updateClassDto: UpdateClassDto,
    @Query("includeSoftDelete", new ParseBoolPipe({ optional: true }))
    includeSoftDelete = false,
  ): Promise<ExistingClassDto> {
    const isAuthorized = await this.authorizationService.canUpdateClass(
      user,
      id,
    );

    if (!isAuthorized) {
      throw new ForbiddenException();
    }

    const klass = await this.classesService.update(
      id,
      updateClassDto,
      includeSoftDelete,
    );
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
