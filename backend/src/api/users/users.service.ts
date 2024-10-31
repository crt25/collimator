import { Injectable } from "@nestjs/common";
import { User, Prisma } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import { UserId } from "./dto";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findByIdOrThrow(id: UserId): Promise<User> {
    return this.prisma.user.findUniqueOrThrow({ where: { id } });
  }

  findMany(args?: Prisma.UserFindManyArgs): Promise<User[]> {
    return this.prisma.user.findMany(args);
  }

  create(user: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({ data: user });
  }

  update(id: UserId, user: Prisma.UserUpdateInput): Promise<User> {
    return this.prisma.user.update({
      data: user,
      where: { id },
    });
  }

  deleteById(id: UserId): Promise<User> {
    return this.prisma.user.delete({ where: { id } });
  }
}
