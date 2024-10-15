import { Injectable } from "@nestjs/common";
import { Prisma, Class } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import { RepositoryService } from "src/prisma/repository.service";
import { CreateClassDto } from "src/classes/dto/create-class.dto";
import { UpdateClassDto } from "src/classes/dto/update-class.dto";

@Injectable()
export class ClassesService extends RepositoryService<
  Class,
  CreateClassDto,
  UpdateClassDto,
  Prisma.ClassWhereInput,
  Prisma.ClassWhereUniqueInput,
  Prisma.ClassInclude,
  Prisma.ClassOrderByWithRelationInput,
  Prisma.ClassCreateInput,
  Prisma.ClassUpdateInput
> {
  constructor(prisma: PrismaService) {
    super(prisma.class);
  }
}
