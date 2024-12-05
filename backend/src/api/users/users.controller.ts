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
} from "@nestjs/common";
import {
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from "@nestjs/swagger";
import { UsersService } from "./users.service";
import {
  CreateUserDto,
  UpdateUserDto,
  ExistingUserDto,
  DeletedUserDto,
  UserId,
} from "./dto";
import { fromQueryResults } from "../helpers";
import { AdminOnly } from "../authentication/role.decorator";
import { AuthenticatedUser } from "../authentication/authenticated-user.decorator";
import { User } from "@prisma/client";
import { AuthorizationService } from "../authorization/authorization.service";
import { UpdateUserKeyDto } from "./dto/update-user-key.dto";

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
  @ApiOkResponse({ type: ExistingUserDto, isArray: true })
  async findAll(): Promise<ExistingUserDto[]> {
    // TODO: add pagination support
    const users = await this.usersService.findMany({});
    return fromQueryResults(ExistingUserDto, users);
  }

  @Get(":id")
  @ApiOkResponse({ type: ExistingUserDto })
  @ApiNotFoundResponse()
  async findOne(
    @AuthenticatedUser() authenticatedUser: User,
    @Param("id", ParseIntPipe) id: UserId,
  ): Promise<ExistingUserDto> {
    const isAuthorized = await this.authorizationService.canViewUser(
      authenticatedUser,
      id,
    );

    if (!isAuthorized) {
      throw new ForbiddenException();
    }

    const user = await this.usersService.findByIdOrThrow(id);
    return ExistingUserDto.fromQueryResult(user);
  }

  @Patch(":id")
  @ApiCreatedResponse({ type: ExistingUserDto })
  @ApiForbiddenResponse()
  @ApiNotFoundResponse()
  async update(
    @AuthenticatedUser() authenticatedUser: User,
    @Param("id", ParseIntPipe) id: UserId,
    @Body() userDto: UpdateUserDto,
  ): Promise<ExistingUserDto> {
    const isAuthorized = await this.authorizationService.canUpdateUser(
      authenticatedUser,
      id,
      userDto.type,
    );

    if (!isAuthorized) {
      throw new ForbiddenException();
    }

    const user = await this.usersService.update(id, userDto);

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
