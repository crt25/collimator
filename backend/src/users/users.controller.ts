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
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UsersService } from "./services/users.service";
import { UserEntity } from "./entities/user.entity";
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from "@nestjs/swagger";

@Controller("users")
@ApiTags("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiCreatedResponse({ type: UserEntity })
  async create(@Body() createUserDto: CreateUserDto): Promise<UserEntity> {
    return new UserEntity(await this.usersService.create(createUserDto));
  }

  @Get()
  @ApiOkResponse({ type: UserEntity, isArray: true })
  async findAll(): Promise<UserEntity[]> {
    const users = await this.usersService.findMany({});

    return users.map((user) => new UserEntity(user));
  }

  @Get("students")
  @ApiOkResponse({ type: UserEntity, isArray: true })
  async findAllStudents(): Promise<UserEntity[]> {
    const students = await this.usersService.findMany({
      where: { Student: { isNot: null } },
    });

    return students.map((s) => new UserEntity(s));
  }

  @Get("teachers")
  @ApiOkResponse({ type: UserEntity, isArray: true })
  async findAllTeachers(): Promise<UserEntity[]> {
    const teachers = await this.usersService.findMany({
      where: { Teacher: { isNot: null } },
    });

    return teachers.map((s) => new UserEntity(s));
  }

  @Get(":id")
  @ApiOkResponse({ type: UserEntity })
  async findOne(
    @Param("id", ParseIntPipe) id: number,
  ): Promise<UserEntity | null> {
    const user = await this.usersService.findUnique({ id });
    return user ? new UserEntity(user) : null;
  }

  @Patch(":id")
  @ApiCreatedResponse({ type: UserEntity })
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserEntity> {
    return this.usersService.update({
      where: { id: id },
      data: updateUserDto,
    });
  }

  @Delete(":id")
  @ApiOkResponse({ type: UserEntity })
  async remove(@Param("id", ParseIntPipe) id: number): Promise<UserEntity> {
    return new UserEntity(await this.usersService.delete({ id }));
  }
}
