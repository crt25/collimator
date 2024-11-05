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
import { plainToInstance } from "class-transformer";
import { UsersService } from "./users.service";
import {
  CreateUserDto,
  UpdateUserDto,
  ExistingUserDto,
  DeletedUserDto,
  UserId,
} from "./dto";

@Controller("users")
@ApiTags("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiCreatedResponse({ type: ExistingUserDto })
  @ApiForbiddenResponse()
  async create(@Body() createUserDto: CreateUserDto): Promise<ExistingUserDto> {
    const user = await this.usersService.create(createUserDto);
    return plainToInstance(ExistingUserDto, user);
  }

  @Get()
  @ApiOkResponse({ type: ExistingUserDto, isArray: true })
  async findAll(): Promise<ExistingUserDto[]> {
    // TODO: add pagination support
    const users = await this.usersService.findMany({});
    return users.map((user) => plainToInstance(ExistingUserDto, user));
  }

  @Get(":id")
  @ApiOkResponse({ type: ExistingUserDto })
  @ApiNotFoundResponse()
  async findOne(
    @Param("id", ParseIntPipe) id: UserId,
  ): Promise<ExistingUserDto> {
    const user = await this.usersService.findByIdOrThrow(id);
    return plainToInstance(ExistingUserDto, user);
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
    return plainToInstance(ExistingUserDto, user);
  }

  @Delete(":id")
  @ApiOkResponse({ type: DeletedUserDto })
  @ApiForbiddenResponse()
  @ApiNotFoundResponse()
  async delete(@Param("id", ParseIntPipe) id: UserId): Promise<DeletedUserDto> {
    const deletedUser = await this.usersService.deleteById(id);
    return plainToInstance(DeletedUserDto, deletedUser);
  }
}
