import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  ForbiddenException,
  ParseBoolPipe,
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
import { User } from "@prisma/client";
import { fromQueryResults } from "../helpers";
import {
  AdminOnly,
  RequiresSoftDeletePermission,
} from "../authentication/role.decorator";
import { AuthenticatedUser } from "../authentication/authenticated-user.decorator";
import { AuthorizationService } from "../authorization/authorization.service";
import {
  CreateUserDto,
  UpdateUserDto,
  ExistingUserDto,
  DeletedUserDto,
  UserId,
} from "./dto";
import { UsersService } from "./users.service";
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
  @AdminOnly()
  @ApiQuery({
    name: "includeSoftDelete",
    required: false,
    type: Boolean,
  })
  @RequiresSoftDeletePermission()
  @ApiOkResponse({ type: ExistingUserDto, isArray: true })
  async findAll(
    @Query("includeSoftDelete", new ParseBoolPipe({ optional: true }))
    includeSoftDelete?: boolean,
  ): Promise<ExistingUserDto[]> {
    // TODO: add pagination support
    const users = await this.usersService.findMany({}, includeSoftDelete);
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
  @RequiresSoftDeletePermission()
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
  @RequiresSoftDeletePermission()
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
  async delete(@Param("id", ParseIntPipe) id: UserId): Promise<DeletedUserDto> {
    const deletedUser = await this.usersService.deleteById(id);
    return DeletedUserDto.fromQueryResult(deletedUser);
  }
}
