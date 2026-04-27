import {
  Body,
  ConflictException,
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
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";
import { User } from "@prisma/client";
import { fromQueryResults } from "../helpers";
import { AdminOnly } from "../authentication/role.decorator";
import { AuthenticatedUser } from "../authentication/authenticated-user.decorator";
import { AuthorizationService } from "../authorization/authorization.service";
import { ErrorCode } from "../exceptions/error-codes";
import {
  CreateUserDto,
  DeletedUserDto,
  ExistingUserDto,
  UpdateUserDto,
  UserId,
} from "./dto";
import { UserOwnsClassesError, UsersService } from "./users.service";
import { UpdateUserKeyDto } from "./dto/update-user-key.dto";
import { RegistrationTokenDto } from "./dto/registration-token.dto";

@Controller("users")
@ApiTags("users")
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authorizationService: AuthorizationService,
  ) {}

  @Post()
  @AdminOnly()
  @ApiCreatedResponse({ type: ExistingUserDto })
  @ApiForbiddenResponse()
  async create(@Body() createUserDto: CreateUserDto): Promise<ExistingUserDto> {
    // TODO: returns 500 if user already exists. Test and fix!
    const user = await this.usersService.create(createUserDto);
    return ExistingUserDto.fromQueryResult(user);
  }

  @Get()
  @ApiQuery({
    name: "includeSoftDelete",
    required: false,
    type: Boolean,
  })
  @ApiOkResponse({ type: ExistingUserDto, isArray: true })
  async findAll(
    @AuthenticatedUser() authenticatedUser: User,
    @Query("includeSoftDelete", new ParseBoolPipe({ optional: true }))
    includeSoftDelete?: boolean,
  ): Promise<ExistingUserDto[]> {
    // TODO: add pagination support

    const users = await this.usersService.findManyForUser(
      authenticatedUser,
      includeSoftDelete,
    );

    return fromQueryResults(ExistingUserDto, users);
  }

  @Get(":id")
  @ApiOkResponse({ type: ExistingUserDto })
  @ApiNotFoundResponse()
  @ApiQuery({
    name: "includeSoftDelete",
    required: false,
    type: Boolean,
  })
  async findOne(
    @AuthenticatedUser() authenticatedUser: User,
    @Param("id", ParseIntPipe) id: UserId,
    @Query("includeSoftDelete", new ParseBoolPipe({ optional: true }))
    includeSoftDelete?: boolean,
  ): Promise<ExistingUserDto> {
    const isAuthorized = await this.authorizationService.canViewUser(
      authenticatedUser,
      id,
    );

    if (!isAuthorized) {
      throw new ForbiddenException();
    }

    const user = await this.usersService.findByIdOrThrow(id, includeSoftDelete);
    return ExistingUserDto.fromQueryResult(user);
  }

  @Patch(":id")
  @ApiCreatedResponse({ type: ExistingUserDto })
  @ApiForbiddenResponse()
  @ApiQuery({
    name: "includeSoftDelete",
    required: false,
    type: Boolean,
  })
  @ApiNotFoundResponse()
  async update(
    @AuthenticatedUser() authenticatedUser: User,
    @Param("id", ParseIntPipe) id: UserId,
    @Body() userDto: UpdateUserDto,
    @Query("includeSoftDelete", new ParseBoolPipe({ optional: true }))
    includeSoftDelete?: boolean,
  ): Promise<ExistingUserDto> {
    const isAuthorized = await this.authorizationService.canUpdateUser(
      authenticatedUser,
      id,
      userDto.type,
    );

    if (!isAuthorized) {
      throw new ForbiddenException();
    }

    const user = await this.usersService.update(id, userDto, includeSoftDelete);

    return ExistingUserDto.fromQueryResult(user);
  }

  @Patch(":id/key")
  @ApiCreatedResponse({ type: Number })
  @ApiForbiddenResponse()
  @ApiNotFoundResponse()
  async updateKey(
    @AuthenticatedUser() authenticatedUser: User,
    @Param("id", ParseIntPipe) id: UserId,
    @Body() userKeyDto: UpdateUserKeyDto,
  ): Promise<number> {
    const isAuthorized = await this.authorizationService.canUpdateUser(
      authenticatedUser,
      id,
      // the type is not changed, so it's the same as the authenticated user
      authenticatedUser.type,
    );

    if (!isAuthorized) {
      throw new ForbiddenException();
    }

    const keyPair = await this.usersService.updateTeacherKey(
      id,
      userKeyDto.key,
    );

    return keyPair.id;
  }

  @Post(":id/registration")
  @AdminOnly()
  @ApiCreatedResponse({ type: RegistrationTokenDto })
  @ApiForbiddenResponse()
  async createRegistrationToken(
    @Param("id", ParseIntPipe) id: UserId,
  ): Promise<RegistrationTokenDto> {
    const registrationToken =
      await this.usersService.createRegistrationTokenOrThrow(id);

    return RegistrationTokenDto.fromQueryResult(registrationToken);
  }

  @Delete(":id")
  @AdminOnly()
  @ApiOkResponse({ type: DeletedUserDto })
  @ApiForbiddenResponse()
  @ApiNotFoundResponse()
  @ApiConflictResponse({
    description: "User owns classes and cannot be deleted",
  })
  async delete(@Param("id", ParseIntPipe) id: UserId): Promise<DeletedUserDto> {
    try {
      const deletedUser = await this.usersService.deleteById(id);
      return DeletedUserDto.fromQueryResult(deletedUser);
    } catch (error) {
      if (error instanceof UserOwnsClassesError) {
        throw new ConflictException({
          errorCode: ErrorCode.USER_OWNS_CLASSES,
        });
      }
      throw error;
    }
  }
}
