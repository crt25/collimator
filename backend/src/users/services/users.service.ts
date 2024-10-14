import { Injectable } from "@nestjs/common";
import { Prisma, User } from "@prisma/client";
import { RepositoryService } from "../../prisma/repository.service";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateUserDto } from "../dto/create-user.dto";
import { UpdateUserDto } from "../dto/update-user.dto";

@Injectable()
export class UsersService extends RepositoryService<
  User,
  CreateUserDto,
  UpdateUserDto,
  Prisma.UserWhereInput,
  Prisma.UserWhereUniqueInput,
  Prisma.UserInclude,
  Prisma.UserOrderByWithRelationInput,
  Prisma.UserCreateInput,
  Prisma.UserUpdateInput
> {
  constructor(prisma: PrismaService) {
    super(prisma.user);
  }
}
