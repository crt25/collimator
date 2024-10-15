import { Injectable } from "@nestjs/common";
import { Prisma, Assignment } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import { RepositoryService } from "src/prisma/repository.service";
import { CreateAssignmentDto } from "./dto/create-assignment.dto";
import { UpdateAssignmentDto } from "./dto/update-assignment.dto";

@Injectable()
export class AssignmentsService extends RepositoryService<
  Assignment,
  CreateAssignmentDto,
  UpdateAssignmentDto,
  Prisma.AssignmentWhereInput,
  Prisma.AssignmentWhereUniqueInput,
  Prisma.AssignmentInclude,
  Prisma.AssignmentOrderByWithRelationInput,
  Prisma.AssignmentCreateInput,
  Prisma.AssignmentUpdateInput
> {
  constructor(prisma: PrismaService) {
    super(prisma.assignment);
  }
}
