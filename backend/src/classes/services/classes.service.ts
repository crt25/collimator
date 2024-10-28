import { Injectable } from "@nestjs/common";
import { Prisma, Class } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateClassDto } from "../dto/create-class.dto";
import { UpdateClassDto } from "../dto/update-class.dto";

@Injectable()
export class ClassesService {
  constructor(private readonly prisma: PrismaService) {}

  async findMany({
    skip,
    take,
    cursor,
    where,
    orderBy,
    include,
  }: {
    skip?: number;
    take?: number;
    cursor?: Prisma.ClassWhereUniqueInput;
    where?: Prisma.ClassWhereInput;
    orderBy?: Prisma.ClassOrderByWithRelationInput;
    include?: Prisma.ClassInclude;
  }): Promise<Class[]> {
    return this.prisma.class.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      include,
    });
  }

  async create(data: CreateClassDto): Promise<Class> {
    return this.prisma.class.create({
      data: data.toInput(),
    });
  }

  async update({
    data,
    where,
  }: {
    where: Prisma.ClassWhereUniqueInput;
    data: UpdateClassDto;
  }): Promise<Class> {
    return this.prisma.class.update({
      data: data.toInput(),
      where,
    });
  }

  async delete(where: Prisma.ClassWhereUniqueInput): Promise<Class> {
    return this.prisma.class.delete({
      where,
    });
  }
}
