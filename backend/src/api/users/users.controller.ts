import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
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

@Controller("users")
@ApiTags("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiCreatedResponse({ type: ExistingUserDto })
  @ApiForbiddenResponse()
  async create(@Body() createUserDto: CreateUserDto): Promise<ExistingUserDto> {
    const user = await this.usersService.create(createUserDto);
    return ExistingUserDto.fromQueryResult(user);
  }

  @Get()
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
    @Param("id", ParseIntPipe) id: UserId,
  ): Promise<ExistingUserDto> {
    const user = await this.usersService.findByIdOrThrow(id);
    return ExistingUserDto.fromQueryResult(user);
  }

  @Patch(":id")
  @ApiCreatedResponse({ type: ExistingUserDto })
  @ApiForbiddenResponse()
  @ApiNotFoundResponse()
  async update(
    @Param("id", ParseIntPipe) id: UserId,
    @Body() userDto: UpdateUserDto,
  ): Promise<ExistingUserDto> {
    const user = await this.usersService.update(id, userDto);
    return ExistingUserDto.fromQueryResult(user);
  }

  @Delete(":id")
  @ApiOkResponse({ type: DeletedUserDto })
  @ApiForbiddenResponse()
  @ApiNotFoundResponse()
  async delete(@Param("id", ParseIntPipe) id: UserId): Promise<DeletedUserDto> {
    const deletedUser = await this.usersService.deleteById(id);
    return DeletedUserDto.fromQueryResult(deletedUser);
  }
}
